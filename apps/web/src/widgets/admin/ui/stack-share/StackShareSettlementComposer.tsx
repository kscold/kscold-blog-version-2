'use client';

import { useMemo, useState } from 'react';
import {
  formatPhoneNumber,
  parseAmount,
  splitEvenly,
  useSendStackShareSettlement,
  useStackShareAccount,
  useStackShareGroups,
  useStackShareParticipants,
} from '@/features/stack-share';
import { useAlert } from '@/shared/model/alertStore';
import { StackShareRecipientEditor } from './StackShareRecipientEditor';
import { StackShareSettlementFields } from './StackShareSettlementFields';
import { StackShareSettlementSummary } from './StackShareSettlementSummary';
import {
  createSettlementRecipientRow,
  findDuplicatedRecipientPhones,
  findValidSettlementRecipients,
  type SettlementRecipientRow,
} from './stackShareSettlementRows';

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
  const [rows, setRows] = useState<SettlementRecipientRow[]>([createSettlementRecipientRow()]);

  const amount = parseAmount(totalAmount);
  const accountReady = account.data?.configured ?? false;
  const ownerName = account.data?.accountHolder?.trim() || '나';
  const validRows = useMemo(() => findValidSettlementRecipients(rows), [rows]);
  const split = useMemo(
    () =>
      splitEvenly({
        totalAmount: amount,
        receiverCount: validRows.length,
        includeOwner,
      }),
    [amount, includeOwner, validRows.length]
  );
  const duplicatedPhones = useMemo(() => findDuplicatedRecipientPhones(validRows), [validRows]);
  const canSend =
    toolName.trim().length > 0 &&
    billingPeriod.trim().length > 0 &&
    amount > 0 &&
    validRows.length > 0 &&
    duplicatedPhones.size === 0 &&
    accountReady;

  const updateRow = (key: string, patch: Partial<SettlementRecipientRow>) => {
    setRows(current => current.map(row => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key: string) => {
    setRows(current =>
      current.length === 1
        ? [createSettlementRecipientRow()]
        : current.filter(row => row.key !== key)
    );
  };

  const applyGroup = (groupId: string) => {
    const group = groups.data?.find(item => item.id === groupId);
    if (!group) return;
    const members = group.participantIds
      .map(id => participants.data?.find(participant => participant.id === id))
      .filter((participant): participant is NonNullable<typeof participant> =>
        Boolean(participant)
      );

    if (members.length === 0) {
      alerts.error('그룹에 담긴 참여자를 찾을 수 없습니다. 그룹을 다시 저장해주세요.');
      return;
    }
    setRows(
      members.map(member =>
        createSettlementRecipientRow(member.name, formatPhoneNumber(member.phoneNumber))
      )
    );
    setIncludeOwner(group.includeOwner);
    if (group.defaultToolName) setToolName(group.defaultToolName);
  };

  const addSavedParticipant = (name: string, phoneNumber: string) => {
    const formatted = formatPhoneNumber(phoneNumber);
    if (rows.some(row => row.phoneNumber === formatted)) return;
    setRows(current => {
      const blank = current.find(row => !row.name.trim() && !row.phoneNumber.trim());
      if (blank) {
        return current.map(row =>
          row.key === blank.key ? { ...row, name, phoneNumber: formatted } : row
        );
      }
      return [...current, createSettlementRecipientRow(name, formatted)];
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
      setRows([createSettlementRecipientRow()]);
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
        <StackShareSettlementFields
          toolName={toolName}
          billingPeriod={billingPeriod}
          totalAmount={totalAmount}
          amount={amount}
          dueDate={dueDate}
          includeOwner={includeOwner}
          ownerName={ownerName}
          recipientCount={validRows.length}
          shareCount={split.shareCount}
          groups={groups.data ?? []}
          onToolNameChange={setToolName}
          onBillingPeriodChange={setBillingPeriod}
          onTotalAmountChange={setTotalAmount}
          onDueDateChange={setDueDate}
          onIncludeOwnerChange={setIncludeOwner}
          onGroupSelect={applyGroup}
        />
        <StackShareRecipientEditor
          rows={rows}
          validCount={validRows.length}
          duplicatedPhones={duplicatedPhones}
          participants={participants.data ?? []}
          onAddRow={() => setRows(current => [...current, createSettlementRecipientRow()])}
          onUpdateRow={updateRow}
          onRemoveRow={removeRow}
          onAddParticipant={addSavedParticipant}
        />
      </div>
      <StackShareSettlementSummary
        split={split}
        recipients={validRows}
        includeOwner={includeOwner}
        ownerName={ownerName}
        accountReady={accountReady}
        displayText={account.data?.displayText}
        contactText={account.data?.contactText}
        dueDate={dueDate}
        canSend={canSend}
        isSending={sendSettlement.isPending}
        onSend={handleSend}
      />
    </section>
  );
}
