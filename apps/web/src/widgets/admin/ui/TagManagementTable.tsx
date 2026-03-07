'use client';

import { useState } from 'react';
import { Tag } from '@/types/blog';

interface TagManagementTableProps {
  tags: Tag[];
  isLoading: boolean;
  onUpdate: (id: string, name: string) => Promise<void>;
  isUpdating: boolean;
  onDelete: (tag: Tag) => void;
  isDeleting: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </div>
    );
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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              태그 이름
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              슬러그
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              포스트 수
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              생성일
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {tags.map(tag => (
            <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3">
                {editingId === tag.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdate(tag.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-purple-500 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                    {tag.name}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                {tag.slug}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                {tag.postCount}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(tag.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {editingId === tag.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdate(tag.id)}
                        disabled={isUpdating}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(tag)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tag)}
                        disabled={isDeleting}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
