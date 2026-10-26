'use client';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { useMermaidInteraction, type MermaidRenderState } from '@/shared/ui/useMermaidInteraction';
import { ensureMermaidFonts, loadMermaid, processMermaidSvg } from '@/shared/lib/mermaid';
import { MermaidToolbar } from '@/shared/ui/mermaid/MermaidToolbar';
import { MermaidDiagram } from '@/shared/ui/mermaid/MermaidDiagram';

interface MermaidBlockProps {
  chart: string;
  theme?: 'light' | 'dark';
}

export function MermaidBlock({ chart, theme = 'light' }: MermaidBlockProps) {
  const blockId = useId().replace(/:/g, '');
  const diagramId = `mermaid-${blockId}`;
  const [svg, setSvg] = useState('');
  const [renderState, setRenderState] = useState<MermaidRenderState>('loading');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nearViewport = useNearViewport(wrapperRef);

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
      className="not-prose relative my-6 overflow-hidden rounded-2xl border shadow-sm"
    >
      {/* Header */}
      <MermaidToolbar
        theme={theme}
        chart={chart}
        isTransformed={isTransformed}
        scale={tf.s}
        onReset={reset}
      />

      {/* Diagram area */}
      <MermaidDiagram
        theme={theme}
        renderState={renderState}
        svg={svg}
        chart={chart}
        containerRef={containerRef}
        contentRef={contentRef}
        containerHeight={containerHeight}
        dragging={dragging}
        transform={tf}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        stopDrag={stopDrag}
      />
    </div>
  );
}

/** 요소가 화면 아래 한 화면 거리 안으로 들어오면 true. 한 번 true가 되면 그대로 둔다. */
function useNearViewport(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
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
