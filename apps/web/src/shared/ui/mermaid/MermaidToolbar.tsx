'use client';

interface MermaidToolbarProps {
  theme: 'light' | 'dark';
  chart: string;
  isTransformed: boolean;
  scale: number;
  onReset: () => void;
}

export function MermaidToolbar({ theme, chart, isTransformed, scale, onReset }: MermaidToolbarProps) {
  const panelClasses =
    theme === 'dark'
      ? 'border-surface-800 bg-[#0f111a]'
      : 'border-surface-200 bg-surface-50';

  return (
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
              onClick={onReset}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                theme === 'dark'
                  ? 'border-surface-700 bg-surface-800 text-surface-300 hover:bg-surface-700 hover:text-white'
                  : 'border-surface-200 bg-white text-surface-500 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              {Math.round(scale * 100)}% · 초기화
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
  );
}
