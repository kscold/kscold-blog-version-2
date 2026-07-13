'use client';

import { useRouter } from 'next/navigation';
import { VaultNote } from '@/shared/model/types/vault';
import { VaultNoteDesktopTable } from './VaultNoteDesktopTable';
import { VaultNoteEmptyState } from './VaultNoteEmptyState';
import { VaultNoteMobileList } from './VaultNoteMobileList';
import { VaultNotePagination } from './VaultNotePagination';

interface VaultNoteListProps {
  notes: VaultNote[];
  totalPages: number;
  totalElements: number;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (note: VaultNote) => void;
}

export function VaultNoteList({
  notes,
  totalPages,
  totalElements,
  page,
  onPageChange,
  onDelete,
}: VaultNoteListProps) {
  const router = useRouter();

  if (notes.length === 0) {
    return <VaultNoteEmptyState onCreate={() => router.push('/admin/vault/new')} />;
  }

  const actions = {
    onDelete,
    onView: (slug: string) => router.push(`/vault/${slug}`),
    onEdit: (id: string) => router.push(`/admin/vault/${id}/edit`),
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <VaultNoteMobileList notes={notes} {...actions} />
      <VaultNoteDesktopTable notes={notes} {...actions} />
      <VaultNotePagination
        totalPages={totalPages}
        totalElements={totalElements}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
}
