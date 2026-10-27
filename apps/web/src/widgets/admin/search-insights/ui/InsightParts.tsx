import type { ReactNode } from 'react';

export function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-surface-900">{title}</h3>
        {note && <span className="text-xs text-surface-400">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <p className="text-xs text-surface-500">{label}</p>
      <p className="mt-3 text-3xl font-black tabular-nums text-surface-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-surface-400">{hint}</p>}
    </div>
  );
}

export function SectionError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      불러오지 못했습니다: {message}
    </p>
  );
}

/** 날짜별 막대. 값이 없는 날도 자리를 지켜 추이가 끊겨 보이지 않게 한다. */
export function DailyBars({ points }: { points: { date: string; value: number }[] }) {
  if (points.length === 0) {
    return <p className="py-6 text-center text-sm text-surface-400">데이터가 없습니다</p>;
  }
  const max = Math.max(...points.map(point => point.value), 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 112 }}>
      {points.map(point => (
        <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-[9px] font-bold leading-none text-surface-700 tabular-nums">
            {point.value > 0 ? point.value : ''}
          </span>
          <div className="flex w-full flex-1 items-end overflow-hidden rounded-xs bg-surface-100">
            <div
              className="w-full rounded-xs bg-surface-800"
              title={`${point.date}: ${point.value}`}
              style={{
                height: `${Math.round((point.value / max) * 100)}%`,
                minHeight: point.value > 0 ? 3 : 0,
              }}
            />
          </div>
          <span className="hidden text-[9px] leading-none text-surface-400 sm:block">
            {point.date.slice(8)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 이름과 숫자 목록. 맨 위 값 대비 비율 막대를 함께 그린다. */
export function RankedList({
  rows,
  empty = '데이터가 없습니다',
}: {
  rows: { label: string; value: number; detail?: string }[];
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-surface-400">{empty}</p>;
  }
  const max = Math.max(...rows.map(row => row.value), 1);
  return (
    <ol className="divide-y divide-surface-50">
      {rows.map((row, index) => (
        <li key={`${row.label}-${index}`} className="py-2.5">
          <div className="flex items-center gap-3">
            <span className="w-5 text-xs font-bold text-surface-400 tabular-nums">{index + 1}</span>
            <span
              className="min-w-0 flex-1 truncate font-mono text-xs text-surface-800"
              title={row.label}
            >
              {row.label}
            </span>
            <span className="shrink-0 text-xs text-surface-500 tabular-nums">
              {row.detail ?? row.value.toLocaleString()}
            </span>
          </div>
          <div className="ml-8 mt-1.5 h-1 overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full rounded-full bg-surface-700"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
