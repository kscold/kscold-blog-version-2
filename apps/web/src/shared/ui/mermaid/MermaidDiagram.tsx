'use client';

import { Skeleton } from '@/shared/ui/Skeleton';

export type MermaidRenderState = 'loading' | 'rendered' | 'error';

interface MermaidDiagramProps {
  theme: 'light' | 'dark';
  renderState: MermaidRenderState;
  svg: string;
  chart: string;
}

export function MermaidDiagram({ theme, renderState, svg, chart }: MermaidDiagramProps) {
  return (
    <div data-mermaid-status={renderState} className="mermaid-diagram-wrapper p-3 sm:p-5">
      {renderState === 'loading' ? (
        <div role="status" aria-label="도표를 불러오는 중">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : renderState === 'error' ? (
        <div className="space-y-3">
          <p className={`text-sm ${theme === 'dark' ? 'text-surface-300' : 'text-surface-600'}`}>
            도표를 표시하지 못했습니다. 원본 내용을 확인해 주세요.
          </p>
          <pre className={`overflow-x-auto rounded-xl p-4 text-sm ${theme === 'dark' ? 'bg-surface-900 text-surface-200' : 'bg-surface-50 text-surface-800'}`}>
            <code>{chart}</code>
          </pre>
        </div>
      ) : (
        // 본문에서는 원래 비율로 전체를 보여 주고 터치·휠을 가로채지 않는다.
        <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </div>
  );
}
