'use client';

import { useParams } from 'next/navigation';
import VaultNoteEditor from '@/widgets/vault/ui/VaultNoteEditor';
import { useVaultNoteEdit } from '@/features/vault/lib/useVaultNoteEdit';

export default function EditVaultNotePage() {
  const { id } = useParams<{ id: string }>();
  const { initialData, isLoading, isError } = useVaultNoteEdit(id);

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-beige dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!initialData) return null;

  return <VaultNoteEditor mode="edit" noteId={id} initialData={initialData} />;
}
