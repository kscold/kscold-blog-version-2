import type { Tag } from '@/types/blog';
import {
  formatTagDate,
  type TagManagementActions,
  type TagManagementEditState,
} from './tagManagementShared';

interface TagManagementDesktopTableProps {
  tags: Tag[];
  editState: TagManagementEditState;
  actions: TagManagementActions;
}

export function TagManagementDesktopTable({
  tags,
  editState,
  actions,
}: TagManagementDesktopTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 sm:block">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                태그 이름
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                슬러그
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                포스트 수
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                생성일
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map(tag => (
              <tr key={tag.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
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
                      className="rounded border border-purple-500 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                      {tag.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">
                  {tag.slug}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                  {tag.postCount}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatTagDate(tag.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
