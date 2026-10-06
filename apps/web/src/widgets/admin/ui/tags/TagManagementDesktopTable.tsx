import type { Tag } from '@/shared/model/types/blog';
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
    <div className="hidden overflow-hidden rounded-3xl border border-surface-200 bg-white sm:block">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                태그 이름
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                슬러그
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-surface-500">
                포스트 수
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                생성일
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {tags.map(tag => (
              <tr key={tag.id} className="transition-colors hover:bg-surface-50">
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
                      className="rounded border border-surface-400 bg-white px-2 py-1 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900/40"
                    />
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-surface-900 px-2.5 py-0.5 text-xs font-medium text-surface-900">
                      {tag.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-surface-500">
                  {tag.slug}
                </td>
                <td className="px-4 py-3 text-center text-sm text-surface-700">
                  {tag.postCount}
                </td>
                <td className="px-4 py-3 text-sm text-surface-500">
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
                          className="text-xs text-green-600 hover:underline disabled:opacity-50"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => actions.setEditingId(null)}
                          className="text-xs text-surface-500 hover:underline"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => actions.startEdit(tag)}
                          className="text-xs font-bold text-surface-900 hover:underline"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => actions.onDelete(tag)}
                          disabled={actions.isDeleting}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
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
