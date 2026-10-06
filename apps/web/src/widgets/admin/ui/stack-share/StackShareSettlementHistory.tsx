'use client';

import {
  formatWon,
  useChangeStackShareSettlementSettled,
  useStackShareSettlements,
} from '@/features/stack-share';
import type { StackShareSettlement } from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import { useAlert } from '@/shared/model/alertStore';

const STATUS_LABEL = { DRAFT: '대기', SENT: '발송 완료', FAILED: '발송 실패' } as const;

export function StackShareSettlementHistory() {
  const alerts = useAlert();
  const settlements = useStackShareSettlements();
  const changeSettled = useChangeStackShareSettlementSettled();

  const handleSettledChange = async (settlement: StackShareSettlement) => {
    const settled = !settlement.settledAt;
    try {
      await changeSettled.mutateAsync({ id: settlement.id, settled });
      alerts.success(settled ? '정산 완료로 표시했습니다.' : '정산 완료 표시를 되돌렸습니다.');
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '정산 상태를 바꾸지 못했습니다.');
    }
  };

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
                {/* 입금까지 끝난 정산은 알림톡 발송 상태 대신 완료 여부를 보여준다. */}
                <span
                  className={`text-xs ${
                    settlement.settledAt ? 'font-bold text-emerald-600' : 'text-surface-400'
                  }`}
                >
                  {settlement.settledAt ? '정산 완료' : STATUS_LABEL[settlement.status]}
                </span>
              </div>
            </summary>
            {settlement.accountText && (
              <p className="mt-4 border-t border-surface-100 pt-4 text-xs text-surface-500">
                안내한 계좌: <strong className="text-surface-800">{settlement.accountText}</strong>
                {settlement.dueDate && <> · 입금 기한: {settlement.dueDate}</>}
                {settlement.contactText && <> · 문의: {settlement.contactText}</>}
              </p>
            )}
            {!!settlement.shareCount && (
              <p className="mt-2 text-xs text-surface-500">
                {settlement.shareCount}명으로 나눔
                {settlement.includeOwner && !!settlement.ownerAmount && (
                  <> · 내 몫 {formatWon(settlement.ownerAmount)}</>
                )}
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-100 pt-4">
              <p className="text-xs text-surface-500">
                {settlement.settledAt
                  ? `${new Date(settlement.settledAt).toLocaleDateString('ko-KR')}에 정산 완료로 표시했습니다.`
                  : '입금을 모두 확인했다면 정산 완료로 표시해두세요.'}
              </p>
              <Button
                size="sm"
                variant={settlement.settledAt ? 'minimal' : 'primary'}
                isLoading={changeSettled.isPending && changeSettled.variables?.id === settlement.id}
                onClick={() => handleSettledChange(settlement)}
              >
                {settlement.settledAt ? '완료 표시 되돌리기' : '정산 완료로 표시'}
              </Button>
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
