'use client';

import Link from 'next/link';
import { AdminActionLink } from '@/shared/ui/AdminPage';
import { Post } from '@/shared/model/types/blog';
import { PostsMobileList } from './PostsMobileList';
import { PostStatusBadge } from './PostStatusBadge';
import { getPostViewHref } from './postLinks';

interface PostsTableProps {
  posts: Post[];
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string, title: string) => void;
}

const HEAD_CELL = 'px-5 py-3.5 text-left text-xs font-bold text-surface-500 whitespace-nowrap';
const PAGE_BUTTON =
  'rounded-[10px] border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50';

export function PostsTable({ posts, totalPages, page, onPageChange, onDelete }: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-3xl border border-surface-200 bg-white py-20 text-center">
        <h2 className="text-xl font-black text-surface-900">포스트가 없습니다</h2>
        <p className="mb-6 mt-2 text-sm text-surface-500">첫 번째 포스트를 작성해보세요.</p>
        <AdminActionLink href="/admin/posts/new">새 포스트 작성</AdminActionLink>
      </div>
    );
  }

  return (
    <>
      <PostsMobileList posts={posts} onDelete={onDelete} />

      <div className="hidden overflow-hidden rounded-3xl border border-surface-200 bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-200 bg-surface-50">
              <tr>
                <th className={HEAD_CELL}>제목</th>
                <th className={HEAD_CELL}>카테고리</th>
                <th className={HEAD_CELL}>상태</th>
                <th className={HEAD_CELL}>조회수</th>
                <th className={HEAD_CELL}>작성일</th>
                <th className={`${HEAD_CELL} text-right`}>작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {posts.map(post => (
                <tr key={post.id} className="transition-colors hover:bg-surface-50">
                  {/* 제목 칸만 남는 폭을 쓰고 줄바꿈하며, 나머지 칸은 한 줄로 유지해 글자가 세로로 쪼개지지 않게 한다. */}
                  <td className="w-full min-w-[16rem] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-sm font-bold text-surface-900 hover:underline"
                      >
                        {post.title}
                      </Link>
                      {post.featured && (
                        <span className="shrink-0 rounded-full bg-surface-900 px-2 py-0.5 text-[11px] font-bold text-white">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-surface-400 [overflow-wrap:anywhere]">
                      /{post.category.slug}/{post.slug}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-surface-600">
                    {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
                    {post.category.name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm tabular-nums text-surface-600">
                    {post.views.toLocaleString('ko-KR')}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-surface-500">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold">
                      <Link
                        href={getPostViewHref(post)}
                        target="_blank"
                        className="rounded-lg px-2.5 py-1.5 text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
                      >
                        보기
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-surface-900 transition-colors hover:bg-surface-100"
                      >
                        수정
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(post.id, post.title)}
                        className="rounded-lg px-2.5 py-1.5 text-red-600 transition-colors hover:bg-red-50"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className={PAGE_BUTTON}
          >
            이전
          </button>
          <span className="px-3 text-sm tabular-nums text-surface-600">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className={PAGE_BUTTON}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
