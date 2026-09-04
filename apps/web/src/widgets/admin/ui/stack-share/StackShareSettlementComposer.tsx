'use client';

import { useMemo, useState } from 'react';
import {
  formatPhoneNumber,
  formatWon,
  parseAmount,
  splitEvenly,
  useSendStackShareSettlement,
  useStackShareAccount,
  useStackShareGroups,
  useStackShareParticipants,
} from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAlert } from '@/shared/model/alertStore';

interface MemberRow {
  /** 행을 다시 그려도 입력 포커스가 튀지 않도록 고정한 키 */
  key: string;
  name: string;
  phoneNumber: string;
}

const PHONE_PATTERN = /^01[016789]-\d{3,4}-\d{4}$/;

const createRow = (name = '', phoneNumber = ''): MemberRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  phoneNumber,
});

/**
 * 카카오페이 1/N 처럼 이름·전화번호만 적어 총액을 엔빵하고 알림톡으로 입금을 요청한다.
 * 나눈 금액은 서버와 같은 규칙(splitEvenly)으로 미리 계산해 보여주므로 실제 발송 금액과 같다.
 */
export function StackShareSettlementComposer() {
  const alerts = useAlert();
  const participants = useStackShareParticipants();
  const groups = useStackShareGroups();
  const account = useStackShareAccount();
  const sendSettlement = useSendStackShareSettlement();

  const [toolName, setToolName] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('이번 달');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [includeOwner, setIncludeOwner] = useState(true);
  const [rows, setRows] = useState<MemberRow[]>([createRow()]);

  const amount = parseAmount(totalAmount);
  const accountReady = account.data?.configured ?? false;
  const ownerName = account.data?.accountHolder?.trim() || '나';

  // 이름과 번호가 모두 유효한 행만 실제 수신자로 센다.
  const validRows = useMemo(
    () => rows.filter(row => row.name.trim().length > 0 && PHONE_PATTERN.test(row.phoneNumber)),
    [rows]
  );
  const split = useMemo(
    () =>
      splitEvenly({
        totalAmount: amount,
        receiverCount: validRows.length,
        includeOwner,
      }),
    [amount, includeOwner, validRows.length]
  );

  const duplicatedPhones = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    validRows.forEach(row => {
      if (seen.has(row.phoneNumber)) duplicates.add(row.phoneNumber);
      seen.add(row.phoneNumber);
    });
    return duplicates;
  }, [validRows]);

  // 계좌가 없으면 서버가 발송을 거부하므로 버튼 단계에서 미리 막는다.
  const canSend =
    toolName.trim().length > 0 &&
    billingPeriod.trim().length > 0 &&
    amount > 0 &&
    validRows.length > 0 &&
    duplicatedPhones.size === 0 &&
    accountReady;

  const updateRow = (key: string, patch: Partial<MemberRow>) => {
    setRows(current => current.map(row => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key: string) => {
    setRows(current => (current.length === 1 ? [createRow()] : current.filter(r => r.key !== key)));
  };

  /** 그룹을 고르면 서비스명·인원·본인 포함 여부를 한 번에 채운다. 입력하던 금액과 기한은 건드리지 않는다. */
  const applyGroup = (groupId: string) => {
    const group = groups.data?.find(item => item.id === groupId);
    if (!group) return;
    const members = group.participantIds
      .map(id => participants.data?.find(participant => participant.id === id))
      .filter((participant): participant is NonNullable<typeof participant> => Boolean(participant));

    if (members.length === 0) {
      alerts.error('그룹에 담긴 참여자를 찾을 수 없습니다. 그룹을 다시 저장해주세요.');
      return;
    }
    setRows(members.map(member => createRow(member.name, formatPhoneNumber(member.phoneNumber))));
    setIncludeOwner(group.includeOwner);
    if (group.defaultToolName) setToolName(group.defaultToolName);
  };

  const addSavedParticipant = (name: string, phoneNumber: string) => {
    const formatted = formatPhoneNumber(phoneNumber);
    if (rows.some(row => row.phoneNumber === formatted)) return;
    setRows(current => {
      // 아직 비어 있는 첫 행이 있으면 그 자리에 채워 빈 줄이 남지 않게 한다.
      const blank = current.find(row => !row.name.trim() && !row.phoneNumber.trim());
      if (blank) {
        return current.map(row =>
          row.key === blank.key ? { ...row, name, phoneNumber: formatted } : row
        );
      }
      return [...current, createRow(name, formatted)];
    });
  };

  const handleSend = async () => {
    if (!canSend) return;
    const summary = includeOwner
      ? `${ownerName} 포함 ${split.shareCount}명으로 나눠 ${validRows.length}명에게`
      : `${validRows.length}명에게`;
    if (!window.confirm(`${summary} 정산 알림톡을 보낼까요?`)) return;

    try {
      const result = await sendSettlement.mutateAsync({
        toolName: toolName.trim(),
        billingPeriod: billingPeriod.trim(),
        totalAmount: amount,
        dueDate: dueDate.trim(),
        includeOwner,
        recipients: validRows.map(row => ({
          name: row.name.trim(),
          phoneNumber: row.phoneNumber,
          email: '',
        })),
      });
      alerts.success(`${result.acceptedCount}명의 발송 요청을 접수했습니다.`);
      setRows([createRow()]);
      setTotalAmount('');
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '정산 알림을 발송하지 못했습니다.');
    }
  };

  return (
    <section className="grid overflow-hidden rounded-3xl border border-surface-200 bg-white lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
          New settlement
        </p>
        <h2 className="mt-3 text-2xl font-black text-surface-900">이번 정산 만들기</h2>
        <p className="mt-2 text-sm text-surface-500">
          이름과 휴대전화만 적으면 총액을 인원수로 나눠 알림톡으로 입금을 요청합니다.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input
            label="툴 또는 구독 이름"
            value={toolName}
            onChange={event => setToolName(event.target.value)}
            placeholder="예: Claude Team"
          />
          <Input
            label="정산 기간"
            value={billingPeriod}
            onChange={event => setBillingPeriod(event.target.value)}
          />
          <Input
            label="총 결제 금액"
            inputMode="numeric"
            value={totalAmount}
            onChange={event => setTotalAmount(event.target.value.replace(/[^0-9]/g, ''))}
            helperText={amount ? formatWon(amount) : '원화 기준'}
          />
          <Input
            label="입금 기한"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            placeholder="예: 9월 5일"
            helperText="비우면 '협의'로 안내됩니다"
          />
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-200 bg-surface-50 p-4">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-surface-900"
            checked={includeOwner}
            onChange={event => setIncludeOwner(event.target.checked)}
          />
          <span className="text-sm">
            <strong className="block font-bold text-surface-900">
              결제한 나({ownerName})도 인원에 넣고 나누기
            </strong>
            <span className="mt-1 block text-surface-500">
              {includeOwner
                ? `받는 사람 ${validRows.length}명 + 나 = ${split.shareCount}명으로 나눕니다. 나에게는 알림톡을 보내지 않습니다.`
                : `받는 사람 ${validRows.length}명끼리만 나눕니다. 내가 낸 몫은 계산하지 않습니다.`}
            </span>
          </span>
        </label>

        {(groups.data?.length ?? 0) > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-bold text-surface-900">정산 그룹으로 채우기</p>
            <div className="flex flex-wrap gap-2">
              {groups.data?.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => applyGroup(group.id)}
                  className="rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-600 transition hover:border-surface-400"
                >
                  {group.name}
                  <span className="ml-1.5 text-xs text-surface-400">
                    {group.participantIds.length}명
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-surface-900">
              받는 사람 <span className="text-surface-400">({validRows.length}명)</span>
            </p>
            <Button size="sm" variant="minimal" onClick={() => setRows(current => [...current, createRow()])}>
              + 사람 추가
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {rows.map((row, index) => {
              const phoneFilled = row.phoneNumber.length > 0;
              const phoneValid = PHONE_PATTERN.test(row.phoneNumber);
              const duplicated = phoneValid && duplicatedPhones.has(row.phoneNumber);
              return (
                <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1.3fr_auto] sm:items-start">
                  <Input
                    aria-label={`${index + 1}번째 받는 사람 이름`}
                    value={row.name}
                    onChange={event => updateRow(row.key, { name: event.target.value })}
                    placeholder="이름"
                  />
                  <Input
                    aria-label={`${index + 1}번째 받는 사람 휴대전화`}
                    inputMode="tel"
                    value={row.phoneNumber}
                    onChange={event =>
                      updateRow(row.key, { phoneNumber: formatPhoneNumber(event.target.value) })
                    }
                    placeholder="010-1234-5678"
                    error={
                      duplicated
                        ? '이미 추가한 번호입니다'
                        : phoneFilled && !phoneValid
                          ? '휴대전화 번호 형식으로 입력해주세요'
                          : undefined
                    }
                  />
                  <Button
                    size="sm"
                    variant="minimal"
                    aria-label={`${index + 1}번째 받는 사람 삭제`}
                    onClick={() => removeRow(row.key)}
                  >
                    삭제
                  </Button>
                </div>
              );
            })}
          </div>

          {(participants.data?.length ?? 0) > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-surface-400">저장된 참여자에서 빠르게 추가</p>
              <div className="flex flex-wrap gap-2">
                {participants.data?.map(participant => {
                  const added = rows.some(
                    row => row.phoneNumber === formatPhoneNumber(participant.phoneNumber)
                  );
                  return (
                    <button
                      key={participant.id}
                      type="button"
                      disabled={added}
                      onClick={() =>
                        addSavedParticipant(participant.name, participant.phoneNumber)
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        added
                          ? 'cursor-default border-surface-200 bg-surface-100 text-surface-400'
                          : 'border-surface-200 bg-white text-surface-600 hover:border-surface-400'
                      }`}
                    >
                      {added ? `${participant.name} 추가됨` : `+ ${participant.name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-900 p-6 text-white sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <h3 className="text-xl font-black">분담 결과</h3>
          <span className="text-xs text-surface-400">
            {split.shareCount > 0 ? `${split.shareCount}명으로 나눔` : '인원 미정'}
          </span>
        </div>

        <div className="min-h-56 space-y-2 py-5">
          {includeOwner && split.ownerAmount > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
              <span>
                {ownerName} <span className="text-surface-400">(나 · 발송 안 함)</span>
              </span>
              <strong>{formatWon(split.ownerAmount)}</strong>
            </div>
          )}
          {validRows.map((row, index) => (
            <div
              key={row.key}
              className="flex justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm"
            >
              <span>{row.name.trim()}</span>
              <strong>{formatWon(split.receiverAmounts[index] ?? 0)}</strong>
            </div>
          ))}
          {validRows.length === 0 && (
            <p className="py-16 text-center text-sm text-surface-400">
              받는 사람의 이름과 휴대전화를 입력해주세요.
            </p>
          )}
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

        <Button
          variant="secondary"
          className="w-full"
          disabled={!canSend}
          isLoading={sendSettlement.isPending}
          onClick={handleSend}
        >
          {validRows.length > 0
            ? `${validRows.length}명에게 정산 요청 보내기`
            : '정산 저장하고 알림톡 보내기'}
        </Button>
      </div>
    </section>
  );
}
