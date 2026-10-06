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
          <tr className="border-b border-surface-200 bg-surface-50">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">
              제목
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">
              태그
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-surface-500">
              조회수
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-surface-500">
              댓글
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">
              날짜
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-surface-500">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200">
          {notes.map(note => (
            <tr
              key={note.id}
              className="transition-colors hover:bg-surface-50"
            >
              <td className="px-6 py-4">
                <div>
                  <p className="max-w-xs truncate text-sm font-medium text-surface-900">
                    {note.title}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">/{note.slug}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="rounded bg-surface-900 px-2 py-0.5 text-[10px] text-surface-900"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-[10px] text-surface-400">+{note.tags.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center text-sm text-surface-600">
                {note.views}
              </td>
              <td className="px-6 py-4 text-center text-sm text-surface-600">
                {note.commentsCount}
              </td>
              <td className="px-6 py-4 text-sm text-surface-600">
                {formatVaultNoteDate(note.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(note.slug)}
                    className="px-3 py-1.5 text-xs font-medium text-surface-600 transition-colors hover:text-surface-900"
                  >
                    보기
                  </button>
                  <button
                    onClick={() => onEdit(note.id)}
                    className="px-3 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:underline"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(note)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700"
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
