'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/api-client';
import { VaultNote } from '@/types/vault';
import VaultNoteEditor from '@/widgets/vault/ui/VaultNoteEditor';

export default function EditVaultNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [initialData, setInitialData] = useState<{
    title: string;
    slug: string;
    content: string;
    folderId: string;
    tags: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        const note = await apiClient.get<VaultNote>(`/vault/notes/${id}`);
        setInitialData({
          title: note.title,
          slug: note.slug,
          content: note.content,
          folderId: note.folderId,
          tags: note.tags?.join(', ') || '',
        });
      } catch (error: any) {
        alert(`노트를 불러올 수 없습니다: ${error.response?.data?.message || error.message}`);
        router.push('/admin/vault');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id, router]);

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
