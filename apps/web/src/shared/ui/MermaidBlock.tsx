'use client';

import { useHydrated } from '@/shared/lib/useBrowserSnapshot';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import type { MermaidRenderState } from '@/shared/ui/mermaid/MermaidDiagram';
import { ensureMermaidFonts, loadMermaid, processMermaidSvg } from '@/shared/lib/mermaid';
import { MermaidToolbar } from '@/shared/ui/mermaid/MermaidToolbar';
import { MermaidDiagram } from '@/shared/ui/mermaid/MermaidDiagram';
import { MermaidViewer } from '@/shared/ui/mermaid/MermaidViewer';

interface MermaidBlockProps {
  chart: string;
  theme?: 'light' | 'dark';
}

export function MermaidBlock({ chart, theme = 'light' }: MermaidBlockProps) {
  const blockId = useId().replace(/:/g, '');
  const diagramId = `mermaid-${blockId}`;
  const [svg, setSvg] = useState('');
  const [renderState, setRenderState] = useState<MermaidRenderState>('loading');
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isExpanded = expandedHeight !== null;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nearViewport = useNearViewport(wrapperRef);

  useEffect(() => {
    // 다이어그램 배치 계산은 수백 ms 동안 화면을 붙잡는다. 첫 화면이 그려진 뒤, 다이어그램이 화면 가까이 왔을 때만 그린다.
    if (!nearViewport) return;
    let active = true;

    const renderDiagram = async () => {
      setRenderState('loading');
      setSvg('');

      try {
        const mermaid = await loadMermaid(theme);

        // 폰트가 로드된 뒤 렌더해야 Mermaid가 노드 크기를 정확히 측정함.
        // (폴백 폰트로 측정하면 텍스트가 박스를 넘어 잘릴 수 있음)
        await ensureMermaidFonts();
        if (!active) return;

        const { svg: raw } = await mermaid.render(diagramId, chart);
        if (!active) return;

        // 실제 텍스트 크기에 맞춰 노드 박스를 동적으로 키운다 (잘림 방지)
        const fitted = processMermaidSvg(raw);
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
  }, [chart, diagramId, theme, nearViewport]);

  return (
    <div
      ref={wrapperRef}
      data-mermaid-block
      className={`not-prose relative my-6 min-w-0 overflow-hidden whitespace-normal rounded-2xl border font-sans shadow-xs ${theme === 'dark' ? 'border-surface-800 bg-surface-950' : 'border-surface-200 bg-white'}`}
    >
      <MermaidToolbar
        theme={theme}
        chart={chart}
        canExpand={renderState === 'rendered'}
        onExpand={() => {
          setExpandedHeight(previewRef.current?.offsetHeight ?? 0);
        }}
      />
      <div ref={previewRef} style={isExpanded ? { height: expandedHeight } : undefined}>
        {isExpanded ? (
          <MermaidViewer svg={svg} theme={theme} onClose={() => setExpandedHeight(null)} />
        ) : (
          <MermaidDiagram theme={theme} renderState={renderState} svg={svg} chart={chart} />
        )}
      </div>
    </div>
  );
}

/** 요소가 화면 아래 한 화면 거리 안으로 들어오면 true. 한 번 true가 되면 그대로 둔다. */
function useNearViewport(ref: RefObject<HTMLElement | null>) {
  const [observed, setNear] = useState(false);
  const hydrated = useHydrated();
  const near = observed || (hydrated && typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100% 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, near]);

  return near;
}
