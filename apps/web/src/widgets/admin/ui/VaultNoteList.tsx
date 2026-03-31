'use client';

import { useRouter } from 'next/navigation';
import { VaultNote } from '@/types/vault';

interface VaultNoteListProps {
  notes: VaultNote[];
  totalPages: number;
  totalElements: number;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (note: VaultNote) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function VaultNoteList({
  notes,
  totalPages,
  totalElements,
  page,
  onPageChange,
  onDelete,
}: VaultNoteListProps) {
  const router = useRouter();

  if (notes.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          노트가 없습니다
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          첫 번째 Vault 노트를 작성해보세요
        </p>
        <button
          onClick={() => router.push('/admin/vault/new')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          새 노트 작성
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div className="space-y-3 p-3 sm:hidden">
        {notes.map(note => (
          <div key={note.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
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
              <span className="col-span-2">{formatDate(note.createdAt)}</span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => router.push(`/vault/${note.slug}`)}
                className="text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                보기
              </button>
              <button
                onClick={() => router.push(`/admin/vault/${note.id}/edit`)}
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

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                태그
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                조회수
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                댓글
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                날짜
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {notes.map(note => (
              <tr
                key={note.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      /{note.slug}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[10px] text-gray-400">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                    {note.views}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                    {note.commentsCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(note.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/vault/${note.slug}`)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      보기
                    </button>
                    <button
                      onClick={() => router.push(`/admin/vault/${note.id}/edit`)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDelete(note)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
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

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {page * 50 + 1}-{Math.min((page + 1) * 50, totalElements)} / {totalElements}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              이전
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
