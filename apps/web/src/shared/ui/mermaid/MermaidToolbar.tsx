'use client';

import { useClipboardCopy } from '@/shared/lib/useClipboardCopy';

interface MermaidToolbarProps {
  theme: 'light' | 'dark';
  chart: string;
  canExpand: boolean;
  onExpand: () => void;
}

export function MermaidToolbar({ theme, chart, canExpand, onExpand }: MermaidToolbarProps) {
  const { copy, label } = useClipboardCopy(chart);
  const buttonClass = 'min-h-11 rounded-lg px-3 text-xs font-semibold transition-colors hover:bg-surface-200/50 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-40';

  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-2 border-b px-3 py-1 sm:px-4 ${theme === 'dark' ? 'border-surface-800 bg-surface-900 text-surface-200' : 'border-surface-200 bg-surface-50 text-surface-600'}`}>
      <span data-code-language="mermaid" className="text-xs font-semibold tracking-wider">MERMAID</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={copy} aria-label="도표 원본 복사" className={buttonClass}>
          <span aria-live="polite">{label}</span>
        </button>
        <button type="button" onClick={onExpand} disabled={!canExpand} aria-haspopup="dialog" className={buttonClass}>
          크게 보기 <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
