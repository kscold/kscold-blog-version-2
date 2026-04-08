import type { Tag } from '@/types/blog';

export interface TagManagementEditState {
  editingId: string | null;
  editingName: string;
}

export interface TagManagementActions {
  isUpdating: boolean;
  isDeleting: boolean;
  setEditingId: (id: string | null) => void;
  setEditingName: (name: string) => void;
  startEdit: (tag: Tag) => void;
  handleUpdate: (id: string) => Promise<void>;
  onDelete: (tag: Tag) => void;
}

export function formatTagDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
