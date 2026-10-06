import type { Tag } from '@/shared/model/types/blog';
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
        <div key={tag.id} className="rounded-2xl border border-surface-200 bg-white p-4">
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
                  className="w-full rounded border border-surface-400 bg-white px-2 py-1 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900/40"
                />
              ) : (
                <span className="inline-flex items-center rounded-full bg-surface-900 px-2.5 py-0.5 text-xs font-medium text-surface-900">
                  {tag.name}
                </span>
              )}
              <p className="mt-2 break-all font-mono text-xs text-surface-500">{tag.slug}</p>
            </div>
            <span className="shrink-0 rounded-full bg-surface-100 px-2 py-1 text-xs text-surface-600">
              {tag.postCount} posts
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-surface-500">{formatTagDate(tag.createdAt)}</span>
            <div className="flex items-center gap-3">
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
          </div>
        </div>
      ))}
    </div>
  );
}
