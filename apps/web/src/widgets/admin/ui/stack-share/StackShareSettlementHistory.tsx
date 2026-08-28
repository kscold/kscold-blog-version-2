'use client';

import { formatWon, useStackShareSettlements } from '@/features/stack-share';

const STATUS_LABEL = { DRAFT: '대기', SENT: '발송 완료', FAILED: '발송 실패' } as const;

export function StackShareSettlementHistory() {
  const settlements = useStackShareSettlements();

  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
        Settlement history
      </p>
      <h2 className="mt-3 text-2xl font-black text-surface-900">최근 정산 기록</h2>
      <div className="mt-6 space-y-3">
        {settlements.data?.map(settlement => (
          <details key={settlement.id} className="rounded-2xl border border-surface-200 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <strong className="text-surface-900">{settlement.toolName}</strong>
                <span className="ml-2 text-sm text-surface-400">{settlement.billingPeriod}</span>
              </div>
              <div className="text-right">
                <strong className="block text-sm text-surface-900">
                  {formatWon(settlement.totalAmount)}
                </strong>
                <span className="text-xs text-surface-400">
                  {STATUS_LABEL[settlement.status]}
                </span>
              </div>
            </summary>
            {settlement.accountText && (
              <p className="mt-4 border-t border-surface-100 pt-4 text-xs text-surface-500">
                안내한 계좌: <strong className="text-surface-800">{settlement.accountText}</strong>
                {settlement.dueDate && <> · 입금 기한: {settlement.dueDate}</>}
              </p>
            )}
            <div className="mt-4 grid gap-2 border-t border-surface-100 pt-4 sm:grid-cols-2">
              {settlement.recipients.map(recipient => (
                <div
                  key={`${settlement.id}-${recipient.participantId}`}
                  className="flex justify-between rounded-xl bg-surface-50 px-3 py-2 text-sm"
                >
                  <span>{recipient.name}</span>
                  <strong>{formatWon(recipient.amount)}</strong>
                </div>
              ))}
            </div>
          </details>
        ))}
        {!settlements.isLoading && settlements.data?.length === 0 && (
          <p className="text-sm text-surface-400">저장된 정산 기록이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
