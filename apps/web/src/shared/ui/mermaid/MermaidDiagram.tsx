'use client';

import { Skeleton } from '@/shared/ui/Skeleton';
import { useMermaidInteraction, type MermaidRenderState } from '@/shared/ui/useMermaidInteraction';

type Interaction = ReturnType<typeof useMermaidInteraction>;

interface MermaidDiagramProps {
  theme: 'light' | 'dark';
  renderState: MermaidRenderState;
  svg: string;
  chart: string;
  containerRef: Interaction['containerRef'];
  contentRef: Interaction['contentRef'];
  containerHeight: Interaction['containerHeight'];
  dragging: Interaction['dragging'];
  transform: Interaction['transform'];
  onMouseDown: Interaction['onMouseDown'];
  onMouseMove: Interaction['onMouseMove'];
  stopDrag: Interaction['stopDrag'];
}

export function MermaidDiagram({
  theme,
  renderState,
  svg,
  chart,
  containerRef,
  contentRef,
  containerHeight,
  dragging,
  transform: tf,
  onMouseDown,
  onMouseMove,
  stopDrag,
}: MermaidDiagramProps) {
  return (
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
  );
}
