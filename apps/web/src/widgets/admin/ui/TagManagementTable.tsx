'use client';

import { useState } from 'react';
import { Tag } from '@/types/blog';
import { TagManagementDesktopTable } from '@/widgets/admin/ui/tags/TagManagementDesktopTable';
import { TagManagementMobileList } from '@/widgets/admin/ui/tags/TagManagementMobileList';
import { TagManagementSkeleton } from '@/widgets/admin/ui/tags/TagManagementSkeleton';

interface TagManagementTableProps {
  tags: Tag[];
  isLoading: boolean;
  onUpdate: (id: string, name: string) => Promise<void>;
  isUpdating: boolean;
  onDelete: (tag: Tag) => void;
  isDeleting: boolean;
}

export function TagManagementTable({
  tags,
  isLoading,
  onUpdate,
  isUpdating,
  onDelete,
  isDeleting,
}: TagManagementTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleUpdate = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    await onUpdate(id, name);
    setEditingId(null);
  };

  if (isLoading) {
    return <TagManagementSkeleton />;
  }

  if (tags.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          등록된 태그가 없습니다.
        </div>
      </div>
    );
  }

  const editState = { editingId, editingName };
  const actions = {
    isUpdating,
    isDeleting,
    setEditingId,
    setEditingName,
    startEdit,
    handleUpdate,
    onDelete,
  };

  return (
    <>
      <TagManagementMobileList tags={tags} editState={editState} actions={actions} />
      <TagManagementDesktopTable tags={tags} editState={editState} actions={actions} />
    </>
  );
}
