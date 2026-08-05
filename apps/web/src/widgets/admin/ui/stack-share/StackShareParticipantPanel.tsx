'use client';

import { useState } from 'react';
import {
  formatPhoneNumber,
  useDeleteStackShareParticipant,
  useSaveStackShareParticipant,
  useStackShareParticipants,
} from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAlert } from '@/shared/model/alertStore';

export function StackShareParticipantPanel() {
  const alerts = useAlert();
  const participants = useStackShareParticipants();
  const saveParticipant = useSaveStackShareParticipant();
  const deleteParticipant = useDeleteStackShareParticipant();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const canSave = name.trim().length > 0 && /^01[016789]-\d{3,4}-\d{4}$/.test(phoneNumber);

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await saveParticipant.mutateAsync({ name, phoneNumber, email });
      setName('');
      setPhoneNumber('');
      setEmail('');
      alerts.success('참여자 정보를 저장했습니다.');
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '참여자를 저장하지 못했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 참여자를 목록에서 삭제할까요?')) return;
    await deleteParticipant.mutateAsync(id);
  };

  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
          Participant directory
        </p>
        <h2 className="mt-3 text-2xl font-black text-surface-900">정산 참여자 관리</h2>
        <p className="mt-3 text-sm leading-6 text-surface-500">
          자주 함께 결제하는 사람을 저장해두면 다음 정산에서 다시 입력하지 않아도 됩니다.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr_auto] lg:items-end">
        <Input label="이름" value={name} onChange={event => setName(event.target.value)} />
        <Input
          label="휴대전화"
          inputMode="tel"
          value={phoneNumber}
          onChange={event => setPhoneNumber(formatPhoneNumber(event.target.value))}
          placeholder="010-1234-5678"
        />
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="선택 입력"
        />
        <Button disabled={!canSave} isLoading={saveParticipant.isPending} onClick={handleSave}>
          저장
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {participants.data?.map(participant => (
          <article key={participant.id} className="rounded-2xl border border-surface-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-surface-900">{participant.name}</p>
                <p className="mt-1 text-sm text-surface-500">{formatPhoneNumber(participant.phoneNumber)}</p>
                {participant.email && (
                  <p className="mt-1 truncate text-xs text-surface-400">{participant.email}</p>
                )}
              </div>
              <Button size="sm" variant="minimal" onClick={() => handleDelete(participant.id)}>
                삭제
              </Button>
            </div>
          </article>
        ))}
        {!participants.isLoading && participants.data?.length === 0 && (
          <p className="text-sm text-surface-400">아직 저장된 참여자가 없습니다.</p>
        )}
      </div>
    </section>
  );
}
