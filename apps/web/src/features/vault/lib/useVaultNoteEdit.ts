import { useRouter } from 'next/navigation';
import { useVaultNoteById } from '@/entities/vault/api/useVault';

export function useVaultNoteEdit(id: string) {
  const router = useRouter();
  const { data: note, isLoading, isError } = useVaultNoteById(id);

  if (isError) {
    router.push('/admin/vault');
  }

  const initialData = note
    ? {
        title: note.title,
        slug: note.slug,
        content: note.content,
        folderId: note.folderId,
        tags: note.tags?.join(', ') || '',
      }
    : null;

  return { initialData, isLoading, isError };
}
