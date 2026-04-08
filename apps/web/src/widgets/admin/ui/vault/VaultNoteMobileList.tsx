import { type VaultNoteListBaseProps, formatVaultNoteDate } from './vaultNoteShared';

export function VaultNoteMobileList({
  notes,
  onDelete,
  onView,
  onEdit,
}: VaultNoteListBaseProps) {
  return (
    <div className="space-y-3 p-3 sm:hidden">
      {notes.map(note => (
        <div
          key={note.id}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{note.title}</p>
            <p className="mt-0.5 break-all text-xs text-gray-500 dark:text-gray-400">/{note.slug}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded bg-purple-100 px-2 py-0.5 text-[10px] text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{note.tags.length - 3}</span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>조회수 {note.views}</span>
            <span>댓글 {note.commentsCount}</span>
            <span className="col-span-2">{formatVaultNoteDate(note.createdAt)}</span>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => onView(note.slug)}
              className="text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              보기
            </button>
            <button
              onClick={() => onEdit(note.id)}
              className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              수정
            </button>
            <button
              onClick={() => onDelete(note)}
              className="text-xs font-medium text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
