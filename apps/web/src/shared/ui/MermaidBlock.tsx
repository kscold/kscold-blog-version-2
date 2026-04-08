'use client';

import { useEffect, useId, useState } from 'react';
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
        });

        const { svg: renderedSvg } = await mermaid.render(diagramId, chart);

        if (!active) {
          return;
        }

        setSvg(renderedSvg);
        setRenderState('rendered');
      } catch (error) {
        console.error('Failed to render Mermaid diagram', error);

        if (!active) {
          return;
        }

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
              className={`text-xs ${
                theme === 'dark' ? 'text-surface-400' : 'text-surface-500'
              }`}
            >
              흐름도, 시퀀스, 상태 다이어그램을 바로 렌더합니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(chart);
            }}
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

      <div
        data-mermaid-status={renderState}
        className={`mermaid-diagram-wrapper overflow-x-auto px-4 py-5 sm:px-6 ${
          theme === 'dark' ? 'bg-[#0f111a]' : 'bg-surface-50'
        }`}
      >
        {renderState === 'loading' ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-[24px]" />
          </div>
        ) : renderState === 'error' ? (
          <div className="space-y-4">
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
            className="mermaid-diagram"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
