'use client';

import VaultNoteEditor from './VaultNoteEditor';
import { useVaultNoteEdit } from '@/features/vault/lib/useVaultNoteEdit';
import { AdminEditorSkeleton } from '@/shared/ui/RouteSkeletons';

interface VaultNoteEditContainerProps {
  noteId: string;
}

export function VaultNoteEditContainer({ noteId }: VaultNoteEditContainerProps) {
  const { initialData, isLoading, isError } = useVaultNoteEdit(noteId);

  if (isError) return null;

  if (isLoading) {
    return <AdminEditorSkeleton />;
  }

  if (!initialData) return null;

  return <VaultNoteEditor mode="edit" noteId={noteId} initialData={initialData} />;
}
