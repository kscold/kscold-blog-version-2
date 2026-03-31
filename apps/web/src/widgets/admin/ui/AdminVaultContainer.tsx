'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAllVaultNotes, useDeleteVaultNote } from '@/entities/vault/api/useVault';
import { VaultNote } from '@/types/vault';
import { VaultNoteList } from './VaultNoteList';
import { useAlert } from '@/shared/model/alertStore';

export function AdminVaultContainer() {
  const router = useRouter();
  const alert = useAlert();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white">
            Vault 노트 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">전체 {totalElements}개의 노트</p>
        </div>
        <button
          onClick={() => router.push('/admin/vault/new')}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg sm:w-auto"
        >
          새 노트 작성
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-white dark:bg-gray-900 rounded-lg animate-pulse" />
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
    </motion.div>
  );
}
