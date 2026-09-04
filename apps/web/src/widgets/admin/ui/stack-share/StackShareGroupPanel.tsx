'use client';

import { useState } from 'react';
import {
  formatPhoneNumber,
  useDeleteStackShareGroup,
  useSaveStackShareGroup,
  useStackShareGroups,
  useStackShareParticipants,
} from '@/features/stack-share';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAlert } from '@/shared/model/alertStore';

/**
 * 자주 함께 정산하는 사람 묶음. 예) "코덱스 그룹".
 * 그룹을 고르면 정산 화면이 서비스명·인원·본인 포함 여부까지 한 번에 채워진다.
 */
export function StackShareGroupPanel() {
  const alerts = useAlert();
  const groups = useStackShareGroups();
  const participants = useStackShareParticipants();
  const saveGroup = useSaveStackShareGroup();
  const deleteGroup = useDeleteStackShareGroup();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [defaultToolName, setDefaultToolName] = useState('');
  const [includeOwner, setIncludeOwner] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const canSave = name.trim().length > 0 && selectedIds.length > 0;

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDefaultToolName('');
    setIncludeOwner(true);
    setSelectedIds([]);
  };

  const startEdit = (id: string) => {
    const group = groups.data?.find(item => item.id === id);
    if (!group) return;
    setEditingId(group.id);
    setName(group.name);
    setDefaultToolName(group.defaultToolName ?? '');
    setIncludeOwner(group.includeOwner);
    setSelectedIds(group.participantIds);
  };

  const toggleParticipant = (id: string) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(value => value !== id) : [...current, id]
    );
  };

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await saveGroup.mutateAsync({
        id: editingId ?? undefined,
        name: name.trim(),
        defaultToolName: defaultToolName.trim(),
        includeOwner,
        participantIds: selectedIds,
      });
      alerts.success(editingId ? '정산 그룹을 수정했습니다.' : '정산 그룹을 만들었습니다.');
      resetForm();
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '정산 그룹을 저장하지 못했습니다.');
    }
  };

  const handleDelete = async (id: string, groupName: string) => {
    if (!window.confirm(`"${groupName}" 그룹을 지울까요? 참여자 정보는 그대로 남습니다.`)) return;
    try {
      await deleteGroup.mutateAsync(id);
      if (editingId === id) resetForm();
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '정산 그룹을 지우지 못했습니다.');
    }
  };

  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
          Settlement groups
        </p>
        <h2 className="mt-3 text-2xl font-black text-surface-900">정산 그룹</h2>
        <p className="mt-3 text-sm leading-6 text-surface-500">
          매달 같은 사람들과 나누는 구독은 그룹으로 묶어두면, 정산할 때 이름을 다시 고르지 않아도
          됩니다.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          label="그룹 이름"
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="예: 코덱스 그룹"
        />
        <Input
          label="기본 서비스명"
          value={defaultToolName}
          onChange={event => setDefaultToolName(event.target.value)}
          placeholder="예: Codex x20"
          helperText="정산 화면에 미리 채워집니다"
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-200 bg-surface-50 p-4">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-surface-900"
          checked={includeOwner}
          onChange={event => setIncludeOwner(event.target.checked)}
        />
        <span className="text-sm">
          <strong className="block font-bold text-surface-900">결제한 나도 인원에 넣기</strong>
          <span className="mt-1 block text-surface-500">
            이 그룹으로 정산할 때의 기본값입니다. 정산 화면에서 바꿀 수 있습니다.
          </span>
        </span>
      </label>

      <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-surface-900">
          그룹에 넣을 사람 <span className="text-surface-400">({selectedIds.length}명)</span>
        </p>
        {participants.data?.length ? (
          <div className="flex flex-wrap gap-2">
            {participants.data.map(participant => {
              const active = selectedIds.includes(participant.id);
              return (
                <button
                  key={participant.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleParticipant(participant.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-surface-900 bg-surface-900 text-white'
                      : 'border-surface-200 bg-white text-surface-600 hover:border-surface-400'
                  }`}
                >
                  {participant.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-surface-400">
            먼저 참여자를 저장하거나, 정산을 한 번 보내면 여기에 나타납니다.
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Button disabled={!canSave} isLoading={saveGroup.isPending} onClick={handleSave}>
          {editingId ? '그룹 수정' : '그룹 만들기'}
        </Button>
        {editingId && (
          <Button variant="minimal" onClick={resetForm}>
            취소
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {groups.data?.map(group => (
          <article key={group.id} className="rounded-2xl border border-surface-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-surface-900">{group.name}</p>
                <p className="mt-1 text-sm text-surface-500">
                  {group.participantIds.length}명
                  {group.includeOwner && ' · 나 포함'}
                  {group.defaultToolName && ` · ${group.defaultToolName}`}
                </p>
                <p className="mt-2 truncate text-xs text-surface-400">
                  {group.participantIds
                    .map(id => participants.data?.find(p => p.id === id))
                    .filter(Boolean)
                    .map(p => `${p!.name}(${formatPhoneNumber(p!.phoneNumber)})`)
                    .join(', ') || '참여자를 찾을 수 없습니다'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button size="sm" variant="minimal" onClick={() => startEdit(group.id)}>
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="minimal"
                  onClick={() => handleDelete(group.id, group.name)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </article>
        ))}
        {!groups.isLoading && groups.data?.length === 0 && (
          <p className="text-sm text-surface-400">아직 만든 그룹이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
