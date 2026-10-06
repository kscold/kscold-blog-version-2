'use client';

import { useState } from 'react';
import { useAllVaultNotes } from '@/entities/vault';
import { useDeleteVaultNote } from '@/features/vault';
import { VaultNote } from '@/shared/model/types/vault';
import { useAlert } from '@/shared/model/alertStore';
import { AdminActionLink, AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { AdminTabs } from '@/shared/ui/AdminTabs';
import { VaultAgentGovernancePanel } from './VaultAgentGovernancePanel';
import { VaultNoteList } from './VaultNoteList';

type VaultTab = 'notes' | 'agent';

const TABS = [
  { key: 'notes', label: '노트' },
  { key: 'agent', label: 'Agent 사용 흐름' },
] as const;

export function AdminVaultContainer() {
  const alert = useAlert();
  const [tab, setTab] = useState<VaultTab>('notes');
  const [page, setPage] = useState(0);
  const { data: notesData, isLoading } = useAllVaultNotes(page, 50);
  const deleteNote = useDeleteVaultNote();

  const notes = notesData?.content || [];
  const totalPages = notesData?.totalPages || 0;
  const totalElements = notesData?.totalElements || 0;

  const handleDelete = async (note: VaultNote) => {
    if (!confirm(`"${note.title}" 노트를 삭제하시겠습니까?`)) return;

    try {
      await deleteNote.mutateAsync(note.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      alert.error(message);
    }
  };

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        eyebrow="Vault"
        title="Vault 노트 관리"
        description={`전체 ${totalElements.toLocaleString('ko-KR')}개의 노트를 관리하고, Agent가 어떤 노트를 근거로 답했는지 확인합니다.`}
        actions={<AdminActionLink href="/admin/vault/new">새 노트 작성</AdminActionLink>}
      />

      {/* 노트 정리가 주된 일이라 먼저 보여주고, Agent 기록은 필요할 때만 넘겨 본다. */}
      <AdminTabs label="Vault 관리 구역" tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'agent' ? (
        <VaultAgentGovernancePanel />
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : (
        <VaultNoteList
          notes={notes}
          totalPages={totalPages}
          totalElements={totalElements}
          page={page}
          onPageChange={setPage}
          onDelete={handleDelete}
        />
      )}
    </AdminPage>
  );
}
