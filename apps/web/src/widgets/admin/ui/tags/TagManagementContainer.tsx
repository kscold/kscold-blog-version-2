'use client';

import { useState } from 'react';
import { useTags } from '@/entities/tag';
import { useCreateTag, useUpdateTag, useDeleteTag } from '@/entities/tag';
import type { Tag } from '@/shared/model/types/blog';
import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { TagCatalogPanel } from './TagCatalogPanel';
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
    <AdminPage>
      <AdminPageHeader
        eyebrow="Tags"
        title="태그 관리"
        description={`총 ${tags.length}개 태그. 새 태그를 만들고, 쓰임이 겹치는 태그는 하나로 합칠 수 있습니다.`}
      />

      {/* 새 태그 폼 */}
      <div className="rounded-3xl border border-surface-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-surface-900 mb-3">새 태그 추가</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="태그 이름 입력"
            className="flex-1 px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-surface-900/40"
          />
          <button
            type="submit"
            disabled={createTag.isPending || !newTagName.trim()}
            className="w-full rounded-[10px] bg-surface-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {createTag.isPending ? '추가 중...' : '추가'}
          </button>
        </form>
      </div>

      <TagCatalogPanel />

      {/* 태그 목록 */}
      <TagManagementTable
        tags={tags}
        isLoading={isLoading}
        onUpdate={handleUpdate}
        isUpdating={updateTag.isPending}
        onDelete={handleDelete}
        isDeleting={deleteTag.isPending}
      />
    </AdminPage>
  );
}
