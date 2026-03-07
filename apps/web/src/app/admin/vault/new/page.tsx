'use client';

import VaultNoteEditor from '@/widgets/vault/ui/VaultNoteEditor';

const defaultData = {
  title: '',
  slug: '',
  content: '',
  folderId: '',
  tags: '',
};

export default function NewVaultNotePage() {
  return <VaultNoteEditor mode="create" initialData={defaultData} />;
}
