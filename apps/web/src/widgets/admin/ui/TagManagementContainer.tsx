'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/entities/tag/api/useTags';
import { Tag } from '@/types/blog';
import { TagManagementTable } from './TagManagementTable';

export function TagManagementContainer() {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newTagName, setNewTagName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    await createTag.mutateAsync(name);
    setNewTagName('');
  };

  const handleUpdate = async (id: string, name: string) => {
    await updateTag.mutateAsync({ id, name });
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`"${tag.name}" 태그를 삭제하시겠습니까?\n이 태그가 적용된 포스트에서도 제거됩니다.`))
      return;
    await deleteTag.mutateAsync(tag.id);
  };

  return (
    <>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        총 {tags.length}개 태그
      </p>

      {/* 새 태그 폼 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">새 태그 추가</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="태그 이름 입력"
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            type="submit"
            disabled={createTag.isPending || !newTagName.trim()}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createTag.isPending ? '추가 중...' : '추가'}
          </button>
        </form>
      </div>

      {/* 태그 목록 */}
      <TagManagementTable
        tags={tags}
        isLoading={isLoading}
        onUpdate={handleUpdate}
        isUpdating={updateTag.isPending}
        onDelete={handleDelete}
        isDeleting={deleteTag.isPending}
      />
    </>
  );
}
