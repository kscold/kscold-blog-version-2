'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';

interface MermaidBlockProps {
  chart: string;
  theme?: 'light' | 'dark';
}

type RenderState = 'loading' | 'rendered' | 'error';

export function MermaidBlock({ chart, theme = 'light' }: MermaidBlockProps) {
  const blockId = useId().replace(/:/g, '');
  const diagramId = `mermaid-${blockId}`;
  const [svg, setSvg] = useState('');
  const [renderState, setRenderState] = useState<RenderState>('loading');
  const [dragging, setDragging] = useState(false);
  const [tf, setTf] = useState({ s: 1, x: 0, y: 0 });
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const commit = useCallback((s: number, x: number, y: number) => {
    scaleRef.current = s;
    txRef.current = x;
    tyRef.current = y;
    setTf({ s, x, y });
  }, []);

  useEffect(() => {
    let active = true;

    const renderDiagram = async () => {
      setRenderState('loading');
      setSvg('');
      setContainerHeight(undefined);
      commit(1, 0, 0);

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme === 'dark' ? 'dark' : 'default',
          fontFamily:
            'Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        });

        const { svg: raw } = await mermaid.render(diagramId, chart);
        if (!active) return;

        // Remove max-width Mermaid injects so the SVG renders at its natural size
        const processed = raw.replace(/max-width\s*:\s*[\d.]+px\s*;?\s*/g, '');
        setSvg(processed);
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
  }, [chart, diagramId, theme, commit]);

  // Auto-fit: scale down to container width if the SVG is wider; record container height
  useEffect(() => {
    if (renderState !== 'rendered') return;
    const raf = requestAnimationFrame(() => {
      if (!containerRef.current || !contentRef.current) return;
      const svgEl = contentRef.current.querySelector('svg');
      if (!svgEl) return;

      const padding = 32; // px-4 sm:px-6 approx
      const containerW = containerRef.current.clientWidth - padding;
      const svgRect = svgEl.getBoundingClientRect();
      const svgW = svgRect.width;
      const svgH = svgRect.height;

      if (svgW > containerW) {
        const fitScale = containerW / svgW;
        commit(fitScale, 0, 0);
        setContainerHeight(Math.ceil(svgH * fitScale) + 40);
      } else {
        setContainerHeight(Math.ceil(svgH) + 40);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [renderState, commit]);

  // Wheel zoom centered on cursor position
  useEffect(() => {
    if (renderState !== 'rendered') return;
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const ns = Math.min(4, Math.max(0.15, scaleRef.current * factor));
      const r = ns / scaleRef.current;
      commit(ns, cx + r * (txRef.current - cx), cy + r * (tyRef.current - cy));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [renderState, commit]);

  // Touch pinch-to-zoom + single-finger pan
  useEffect(() => {
    if (renderState !== 'rendered') return;
    const el = containerRef.current;
    if (!el) return;

    let lastDist: number | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const [t1, t2] = Array.from(e.touches);
        lastDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      } else if (e.touches.length === 1) {
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastDist = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && lastDist !== null) {
        const [t1, t2] = Array.from(e.touches);
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const mid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
        const rect = el.getBoundingClientRect();
        const cx = mid.x - rect.left;
        const cy = mid.y - rect.top;
        const factor = dist / lastDist;
        const ns = Math.min(4, Math.max(0.15, scaleRef.current * factor));
        const r = ns / scaleRef.current;
        commit(ns, cx + r * (txRef.current - cx), cy + r * (tyRef.current - cy));
        lastDist = dist;
      } else if (e.touches.length === 1 && lastDist === null) {
        const dx = e.touches[0].clientX - lastPos.current.x;
        const dy = e.touches[0].clientY - lastPos.current.y;
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        commit(scaleRef.current, txRef.current + dx, tyRef.current + dy);
      }
    };

    const onTouchEnd = () => { lastDist = null; };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [renderState, commit]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    commit(scaleRef.current, txRef.current + dx, tyRef.current + dy);
  }, [commit]);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
  }, []);

  const isTransformed = tf.s !== 1 || tf.x !== 0 || tf.y !== 0;
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
                onClick={() => commit(1, 0, 0)}
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
