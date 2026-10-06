'use client';

import Link from 'next/link';
import { useDashboardAttention } from '../../api/useDashboardAttention';

/** 들어오자마자 처리할 일을 먼저 보여준다. 남은 일이 없으면 한 줄로 알리고 자리를 차지하지 않는다. */
export function DashboardAttention() {
  const { items, isLoading } = useDashboardAttention();
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section
      aria-labelledby="dashboard-attention-title"
      className="rounded-3xl border border-surface-200 bg-white p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="dashboard-attention-title" className="text-lg font-black text-surface-900">
          확인이 필요한 일
        </h2>
        {!isLoading && (
          <span className="text-xs font-bold text-surface-400">
            {total === 0 ? '모두 처리됨' : `${total}건`}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 h-[72px] animate-pulse rounded-2xl bg-surface-100" />
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-surface-500">지금 처리할 일이 없습니다.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center justify-between gap-4 rounded-2xl bg-surface-900 p-4 text-white transition-colors hover:bg-surface-800"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold">{item.label}</span>
                <span className="mt-1 block text-xs text-surface-400">{item.hint}</span>
              </span>
              <span className="shrink-0 text-2xl font-black tabular-nums">{item.count}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
