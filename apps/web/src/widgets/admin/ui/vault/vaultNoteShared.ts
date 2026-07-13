import type { VaultNote } from '@/shared/model/types/vault';

export interface VaultNoteListBaseProps {
  notes: VaultNote[];
  onDelete: (note: VaultNote) => void;
  onView: (slug: string) => void;
  onEdit: (id: string) => void;
}

export function formatVaultNoteDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
