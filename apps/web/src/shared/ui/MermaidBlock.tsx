'use client';

import { useEffect, useId, useState } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useMermaidInteraction } from '@/shared/ui/useMermaidInteraction';

interface MermaidBlockProps {
  chart: string;
  theme?: 'light' | 'dark';
}

type RenderState = 'loading' | 'rendered' | 'error';

/**
 * Mermaid가 측정한 노드 박스가 실제 렌더된 텍스트보다 작아 잘리는 경우,
 * SVG를 화면 밖에 잠시 마운트해 각 노드 라벨의 실제 크기를 재고 박스를 키운다.
 * (Pretendard 같은 웹폰트는 Mermaid 측정 폰트와 미세하게 달라 잘림이 생긴다)
 */
function fitNodesToText(rawSvg: string): string {
  if (typeof document === 'undefined') return rawSvg;

  const tmp = document.createElement('div');
  tmp.className = 'mermaid-diagram';
  tmp.style.cssText = 'position:absolute; left:-99999px; top:0; visibility:hidden; width:auto;';
  tmp.innerHTML = rawSvg;
  document.body.appendChild(tmp);

  try {
    const svg = tmp.querySelector('svg');
    if (!svg) return rawSvg;

    // 텍스트 주위에 항상 확보할 최소 여백(상하/좌우 합산 px)
    const VPAD = 22;
    const HPAD = 24;
    // 원통은 위아래 타원 곡면이 공간을 먹으므로 세로 여백을 더 준다
    const CYLINDER_EXTRA_V = 24;

    svg.querySelectorAll<SVGGElement>('g.node').forEach(node => {
      const fo = node.querySelector('foreignObject');
      const label = fo?.firstElementChild as HTMLElement | null;
      if (!fo || !label) return;

      const rect = node.querySelector<SVGRectElement>('rect');
      const curveShape = rect
        ? null
        : node.querySelector<SVGGraphicsElement>('path, polygon, circle, ellipse');
      const isCylinder = !rect && curveShape?.tagName.toLowerCase() === 'path';

      // 실제 콘텐츠 크기 (transform/scale 영향 없는 레이아웃 픽셀)
      const needH = label.scrollHeight;
      const needW = label.scrollWidth;
      const foH = fo.height.baseVal.value;
      const foW = fo.width.baseVal.value;

      // 넘칠 때뿐 아니라, 빠듯할 때도 최소 여백을 확보하도록 목표 크기를 계산
      const targetH = needH + VPAD + (isCylinder ? CYLINDER_EXTRA_V : 0);
      const targetW = needW + HPAD;
      const dh = targetH > foH ? targetH - foH : 0;
      const dw = targetW > foW ? targetW - foW : 0;
      if (dh === 0 && dw === 0) return;

      // foreignObject(라벨 영역) 확장 + 중심 유지
      if (dh > 0) {
        fo.setAttribute('height', String(foH + dh));
        fo.setAttribute('y', String(fo.y.baseVal.value - dh / 2));
      }
      if (dw > 0) {
        fo.setAttribute('width', String(foW + dw));
        fo.setAttribute('x', String(fo.x.baseVal.value - dw / 2));
      }

      // 노드 모양(rect/cylinder/diamond 등)을 라벨에 맞춰 키운다.
      if (rect) {
        // 사각형은 width/height 속성을 직접 조정 (정확)
        if (dh > 0) {
          rect.setAttribute('height', String(rect.height.baseVal.value + dh));
          rect.setAttribute('y', String(rect.y.baseVal.value - dh / 2));
        }
        if (dw > 0) {
          rect.setAttribute('width', String(rect.width.baseVal.value + dw));
          rect.setAttribute('x', String(rect.x.baseVal.value - dw / 2));
        }
      } else if (curveShape) {
        // 원통(path)·다이아몬드(polygon)·원(circle) 등은 형태를 중심 기준으로 스케일
        const box = curveShape.getBBox();
        if (box.width === 0 || box.height === 0) return;
        const sx = dw > 0 ? (box.width + dw) / box.width : 1;
        const sy = dh > 0 ? (box.height + dh) / box.height : 1;
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const prev = curveShape.getAttribute('transform') ?? '';
        curveShape.setAttribute(
          'transform',
          `${prev} translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`.trim()
        );
      }
    });

    return tmp.innerHTML;
  } catch {
    return rawSvg;
  } finally {
    document.body.removeChild(tmp);
  }
}

export function MermaidBlock({ chart, theme = 'light' }: MermaidBlockProps) {
  const blockId = useId().replace(/:/g, '');
  const diagramId = `mermaid-${blockId}`;
  const [svg, setSvg] = useState('');
  const [renderState, setRenderState] = useState<RenderState>('loading');

  const {
    containerRef,
    contentRef,
    transform: tf,
    dragging,
    containerHeight,
    isTransformed,
    reset,
    onMouseDown,
    onMouseMove,
    stopDrag,
  } = useMermaidInteraction(renderState);

  useEffect(() => {
    let active = true;

    const renderDiagram = async () => {
      setRenderState('loading');
      setSvg('');

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme === 'dark' ? 'dark' : 'default',
          fontFamily:
            'Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          flowchart: {
            htmlLabels: true,
            useMaxWidth: true,
            padding: 12,
            wrappingWidth: 260,
          },
        });

        // 폰트가 로드된 뒤 렌더해야 Mermaid가 노드 크기를 정확히 측정한다.
        // (폴백 폰트로 측정하면 텍스트가 박스를 넘어 잘릴 수 있음)
        if (typeof document !== 'undefined' && document.fonts) {
          try {
            await document.fonts.load('400 16px "Pretendard Variable"');
            await document.fonts.ready;
          } catch {
            /* 폰트 로드 실패 시 그대로 진행 */
          }
        }
        if (!active) return;

        const { svg: raw } = await mermaid.render(diagramId, chart);
        if (!active) return;

        // Remove max-width Mermaid injects so the SVG renders at its natural size
        const processed = raw.replace(/max-width\s*:\s*[\d.]+px\s*;?\s*/g, '');
        // 실제 텍스트 크기에 맞춰 노드 박스를 동적으로 키운다 (잘림 방지)
        const fitted = fitNodesToText(processed);
        if (!active) return;
        setSvg(fitted);
        setRenderState('rendered');
      } catch (error) {
        console.error('Failed to render Mermaid diagram', error);
        if (!active) return;
        setRenderState('error');
      }
    };

    void renderDiagram();
    return () => {
      active = false;
    };
  }, [chart, diagramId, theme]);

  const panelClasses =
    theme === 'dark'
      ? 'border-surface-800 bg-[#0f111a]'
      : 'border-surface-200 bg-surface-50';

  return (
    <div className="not-prose relative my-6 overflow-hidden rounded-2xl border shadow-sm">
      {/* Header */}
      <div className={`border-b px-4 py-3 ${panelClasses}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <span
              data-code-language="mermaid"
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                theme === 'dark'
                  ? 'bg-surface-800/90 text-surface-300'
                  : 'bg-white/90 text-surface-500 shadow-sm'
              }`}
            >
              Mermaid
            </span>
            <span
              className={`hidden text-xs sm:inline ${
                theme === 'dark' ? 'text-surface-400' : 'text-surface-500'
              }`}
            >
              스크롤로 확대 · 드래그로 이동
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isTransformed && (
              <button
                type="button"
                onClick={reset}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'border-surface-700 bg-surface-800 text-surface-300 hover:bg-surface-700 hover:text-white'
                    : 'border-surface-200 bg-white text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                {Math.round(tf.s * 100)}% · 초기화
              </button>
            )}
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(chart)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                theme === 'dark'
                  ? 'border-surface-700 bg-surface-800 text-surface-100 hover:bg-surface-700 hover:text-white'
                  : 'border-surface-200 bg-white text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Diagram area */}
      <div
        data-mermaid-status={renderState}
        ref={containerRef}
        className={`mermaid-diagram-wrapper relative overflow-hidden py-5 ${
          theme === 'dark' ? 'bg-[#0f111a]' : 'bg-surface-50'
        } ${renderState === 'rendered' ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        style={{
          height: containerHeight ?? (renderState === 'rendered' ? 240 : undefined),
          minHeight: renderState !== 'rendered' ? 'auto' : undefined,
        }}
        onMouseDown={renderState === 'rendered' ? onMouseDown : undefined}
        onMouseMove={renderState === 'rendered' ? onMouseMove : undefined}
        onMouseUp={renderState === 'rendered' ? stopDrag : undefined}
        onMouseLeave={renderState === 'rendered' ? stopDrag : undefined}
      >
        {renderState === 'loading' ? (
          <div className="space-y-4 px-4 sm:px-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-[24px]" />
          </div>
        ) : renderState === 'error' ? (
          <div className="space-y-4 px-4 sm:px-6">
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                theme === 'dark'
                  ? 'border-amber-800 bg-amber-950/40 text-amber-200'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              Mermaid 다이어그램을 렌더하지 못했습니다. 아래 원본 문법을 확인해 주세요.
            </div>
            <pre
              className={`overflow-x-auto rounded-2xl border p-5 text-sm ${
                theme === 'dark'
                  ? 'border-surface-800 bg-surface-950 text-surface-100'
                  : 'border-surface-200 bg-white text-surface-800'
              }`}
            >
              <code>{chart}</code>
            </pre>
          </div>
        ) : (
          <div
            ref={contentRef}
            className="mermaid-diagram select-none px-4 sm:px-6"
            style={{
              transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.s})`,
              transformOrigin: '0 0',
              transition: dragging ? 'none' : 'transform 0.08s ease-out',
              willChange: 'transform',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
