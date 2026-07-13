'use client';

export type VisitWindow = 7 | 14 | 30;

interface Props {
  window: VisitWindow;
  onSelect: (w: VisitWindow) => void;
  totalVisits: number;
}

export function VisitWindowSelector({ window, onSelect, totalVisits }: Props) {
  return (
    <div className="flex items-center gap-2">
      {([7, 14, 30] as const).map(w => (
        <button
          key={w}
          onClick={() => onSelect(w)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
            window === w
              ? 'bg-surface-900 text-white'
              : 'bg-white border border-surface-200 text-surface-500 hover:text-surface-900'
          }`}
        >
          최근 {w}일
        </button>
      ))}
      <span className="ml-auto text-xs text-surface-400 tabular-nums">
        합계 {totalVisits.toLocaleString()}회
      </span>
    </div>
  );
}
