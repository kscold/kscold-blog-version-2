'use client';

import Link from 'next/link';
import { useAdminFeed } from '../../api/useAdminFeed';
import { formatDateTime } from '@/shared/lib/format-utils';
import { AdminActionLink, AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { Pagination } from '@/shared/ui/Pagination';

export function FeedManagementTable() {
  const { feeds, totalPages, page, setPage, isLoading, handleDelete } = useAdminFeed();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        eyebrow="Feed"
        title="피드 관리"
        description="짧은 기록과 링크를 올리고, 공개 범위와 반응을 한곳에서 살펴봅니다."
        actions={<AdminActionLink href="/admin/feed/new">새 피드 작성</AdminActionLink>}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-surface-200 bg-white"
            />
          ))}
        </div>
      ) : feeds.length > 0 ? (
        <>
          <div className="space-y-3 sm:hidden">
            {feeds.map(feed => (
              <div key={feed.id} className="rounded-2xl border border-surface-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm text-surface-900 line-clamp-3">
                    {feed.content}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                      feed.visibility === 'PUBLIC'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-surface-100 text-surface-500'
                    }`}
                  >
                    {feed.visibility === 'PUBLIC' ? '공개' : '비공개'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-surface-500">
                  <span>이미지 {feed.images.length}</span>
                  <span>좋아요 {feed.likesCount}</span>
                  <span>댓글 {feed.commentsCount}</span>
                  <span>{formatDateTime(feed.createdAt)}</span>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <Link
                    href={`/feed/${feed.id}`}
                    className="text-xs font-bold text-surface-500 hover:text-surface-900"
                  >
                    보기
                  </Link>
                  <Link
                    href={`/admin/feed/${feed.id}/edit`}
                    className="text-xs font-bold text-surface-900 hover:underline"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(feed.id)}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-surface-200 bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      내용
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      이미지
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      공개
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      좋아요
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      댓글
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {feeds.map(feed => (
                    <tr key={feed.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm text-surface-900 line-clamp-1 max-w-xs">
                          {feed.content}
                        </p>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-sm text-surface-500">{feed.images.length}</span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            feed.visibility === 'PUBLIC'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-surface-100 text-surface-500'
                          }`}
                        >
                          {feed.visibility === 'PUBLIC' ? '공개' : '비공개'}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4 text-sm text-surface-500">
                        {feed.likesCount}
                      </td>
                      <td className="text-center px-4 py-4 text-sm text-surface-500">
                        {feed.commentsCount}
                      </td>
                      <td className="text-center px-4 py-4 text-xs text-surface-400">
                        {formatDateTime(feed.createdAt)}
                      </td>
                      <td className="text-right px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/feed/${feed.id}`}
                            className="text-xs font-bold text-surface-500 hover:text-surface-900"
                          >
                            보기
                          </Link>
                          <Link
                            href={`/admin/feed/${feed.id}/edit`}
                            className="text-xs font-bold text-surface-900 hover:underline"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(feed.id)}
                            className="text-xs font-bold text-red-600 hover:underline"
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
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-surface-200 bg-white py-20 text-center">
          <h2 className="text-xl font-black text-surface-900">피드가 없습니다</h2>
          <p className="mb-6 mt-2 text-sm text-surface-500">첫 피드를 작성해보세요.</p>
          <AdminActionLink href="/admin/feed/new">새 피드 작성</AdminActionLink>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminPage>
  );
}
