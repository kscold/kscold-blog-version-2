'use client';

import { useMemo, useState } from 'react';
import {
  formatWon,
  parseAmount,
  useSendStackShareSettlement,
  useStackShareAccount,
  useStackShareParticipants,
} from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAlert } from '@/shared/model/alertStore';

export function StackShareSettlementComposer() {
  const alerts = useAlert();
  const participants = useStackShareParticipants();
  const account = useStackShareAccount();
  const sendSettlement = useSendStackShareSettlement();
  const [toolName, setToolName] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('이번 달');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const amount = parseAmount(totalAmount);
  const accountReady = account.data?.configured ?? false;

  const selected = useMemo(
    () => participants.data?.filter(participant => selectedIds.includes(participant.id)) ?? [],
    [participants.data, selectedIds]
  );
  const shares = useMemo(() => {
    if (selected.length === 0 || amount === 0) return [];
    const base = Math.floor(amount / selected.length);
    const remainder = amount % selected.length;
    return selected.map((participant, index) => ({
      ...participant,
      amount: base + (index < remainder ? 1 : 0),
    }));
  }, [amount, selected]);
  // 계좌가 없으면 서버가 발송을 거부하므로 버튼 단계에서 미리 막는다.
  const canSend =
    toolName.trim().length > 0 &&
    billingPeriod.trim().length > 0 &&
    shares.length > 0 &&
    accountReady;

  const toggleParticipant = (id: string) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(value => value !== id) : [...current, id]
    );
  };

  const handleSend = async () => {
    if (!canSend || !window.confirm(`${shares.length}명에게 정산 알림톡을 보낼까요?`)) return;
    try {
      const result = await sendSettlement.mutateAsync({
        toolName: toolName.trim(),
        billingPeriod: billingPeriod.trim(),
        totalAmount: amount,
        dueDate: dueDate.trim(),
        recipients: shares.map(({ name, phoneNumber, email }) => ({ name, phoneNumber, email })),
      });
      alerts.success(`${result.acceptedCount}명의 발송 요청을 접수했습니다.`);
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '정산 알림을 발송하지 못했습니다.');
    }
  };

  return (
    <section className="grid overflow-hidden rounded-3xl border border-surface-200 bg-white lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">New settlement</p>
        <h2 className="mt-3 text-2xl font-black text-surface-900">이번 정산 만들기</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="툴 또는 구독 이름" value={toolName} onChange={event => setToolName(event.target.value)} placeholder="예: Claude Team" />
          <Input label="정산 기간" value={billingPeriod} onChange={event => setBillingPeriod(event.target.value)} />
          <Input label="총 결제 금액" inputMode="numeric" value={totalAmount} onChange={event => setTotalAmount(event.target.value.replace(/[^0-9]/g, ''))} helperText={amount ? formatWon(amount) : '원화 기준'} />
          <Input label="입금 기한" value={dueDate} onChange={event => setDueDate(event.target.value)} placeholder="예: 9월 5일" helperText="비우면 '협의'로 안내됩니다" />
        </div>
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-surface-900">참여자 선택</p>
          <div className="flex flex-wrap gap-2">
            {participants.data?.map(participant => {
              const active = selectedIds.includes(participant.id);
              return (
                <button key={participant.id} type="button" aria-pressed={active} onClick={() => toggleParticipant(participant.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-surface-900 bg-surface-900 text-white' : 'border-surface-200 bg-white text-surface-600 hover:border-surface-400'}`}>
                  {participant.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-surface-900 p-6 text-white sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <h3 className="text-xl font-black">분담 결과</h3>
          <span className="text-xs text-surface-400">{shares.length}명</span>
        </div>
        <div className="min-h-56 space-y-2 py-5">
          {shares.map(participant => (
            <div key={participant.id} className="flex justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
              <span>{participant.name}</span><strong>{formatWon(participant.amount)}</strong>
            </div>
          ))}
          {shares.length === 0 && <p className="py-16 text-center text-sm text-surface-400">참여자와 금액을 선택해주세요.</p>}
        </div>

        <div className="mb-4 rounded-2xl bg-white/5 px-4 py-3 text-xs">
          <p className="text-surface-400">받는 사람에게 안내될 입금 계좌</p>
          {accountReady ? (
            <p className="mt-1 font-bold text-white">{account.data?.displayText}</p>
          ) : (
            <p className="mt-1 font-bold text-amber-300">
              입금 계좌를 먼저 등록해주세요. 등록 전에는 발송할 수 없습니다.
            </p>
          )}
          {accountReady && account.data?.contactText && (
            <p className="mt-1 text-surface-300">문의: {account.data.contactText}</p>
          )}
          <p className="mt-2 text-surface-400">입금 기한: {dueDate.trim() || '협의'}</p>
        </div>

        <Button variant="secondary" className="w-full" disabled={!canSend} isLoading={sendSettlement.isPending} onClick={handleSend}>
          정산 저장하고 알림톡 보내기
        </Button>
      </div>
    </section>
  );
}
