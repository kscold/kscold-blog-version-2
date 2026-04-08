import { type VaultNoteListBaseProps, formatVaultNoteDate } from './vaultNoteShared';

export function VaultNoteDesktopTable({
  notes,
  onDelete,
  onView,
  onEdit,
}: VaultNoteListBaseProps) {
  return (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              제목
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              태그
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              조회수
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              댓글
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              날짜
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {notes.map(note => (
            <tr
              key={note.id}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-6 py-4">
                <div>
                  <p className="max-w-xs truncate text-sm font-medium text-gray-900 dark:text-white">
                    {note.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">/{note.slug}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
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
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {note.views}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {note.commentsCount}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatVaultNoteDate(note.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(note.slug)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    보기
                  </button>
                  <button
                    onClick={() => onEdit(note.id)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(note)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
