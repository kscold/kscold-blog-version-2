'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVaultNoteById } from '@/entities/vault/api/useVault';
import VaultNoteEditor from '@/widgets/vault/ui/VaultNoteEditor';

export default function EditVaultNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: note, isLoading, isError } = useVaultNoteById(id);

  if (isError) {
    router.push('/admin/vault');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-beige dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!note) return null;

  const initialData = {
    title: note.title,
    slug: note.slug,
    content: note.content,
    folderId: note.folderId,
    tags: note.tags?.join(', ') || '',
  };

  return <VaultNoteEditor mode="edit" noteId={id} initialData={initialData} />;
}
