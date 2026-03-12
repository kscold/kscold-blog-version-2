'use client';

import { useParams } from 'next/navigation';
import { VaultNoteEditContainer } from '@/widgets/vault/ui/VaultNoteEditContainer';

export default function EditVaultNotePage() {
  const { id } = useParams<{ id: string }>();

  return <VaultNoteEditContainer noteId={id} />;
}
