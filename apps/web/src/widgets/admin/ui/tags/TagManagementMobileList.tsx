import type { Tag } from '@/types/blog';
import {
  formatTagDate,
  type TagManagementActions,
  type TagManagementEditState,
} from './tagManagementShared';

interface TagManagementMobileListProps {
  tags: Tag[];
  editState: TagManagementEditState;
  actions: TagManagementActions;
}

export function TagManagementMobileList({
  tags,
  editState,
  actions,
}: TagManagementMobileListProps) {
  return (
    <div className="space-y-3 sm:hidden">
      {tags.map(tag => (
        <div
          key={tag.id}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {editState.editingId === tag.id ? (
                <input
                  type="text"
                  value={editState.editingName}
                  onChange={event => actions.setEditingName(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') void actions.handleUpdate(tag.id);
                    if (event.key === 'Escape') actions.setEditingId(null);
                  }}
                  autoFocus
                  className="w-full rounded border border-purple-500 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
                />
              ) : (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {tag.name}
                </span>
              )}
              <p className="mt-2 break-all font-mono text-xs text-gray-500 dark:text-gray-400">
                {tag.slug}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {tag.postCount} posts
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTagDate(tag.createdAt)}
            </span>
            <div className="flex items-center gap-3">
              {editState.editingId === tag.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => void actions.handleUpdate(tag.id)}
                    disabled={actions.isUpdating}
                    className="text-xs text-green-600 hover:underline disabled:opacity-50 dark:text-green-400"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.setEditingId(null)}
                    className="text-xs text-gray-500 hover:underline dark:text-gray-400"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => actions.startEdit(tag)}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.onDelete(tag)}
                    disabled={actions.isDeleting}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
