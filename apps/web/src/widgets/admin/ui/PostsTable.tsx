'use client';

import Link from 'next/link';
import { Post } from '@/types/blog';

interface PostsTableProps {
  posts: Post[];
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string, title: string) => void;
}

function getStatusBadge(status: string) {
  const styles = {
    PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };
  const labels = {
    PUBLISHED: '발행됨',
    DRAFT: '초안',
    ARCHIVED: '보관됨',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[status as keyof typeof styles]
      }`}
    >
      {labels[status as keyof typeof labels]}
    </span>
  );
}

export function PostsTable({ posts, totalPages, page, onPageChange, onDelete }: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          포스트가 없습니다
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          첫 번째 포스트를 작성해보세요!
        </p>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          새 포스트 작성
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* 모바일: 카드 레이아웃 */}
      <div className="sm:hidden space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{post.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
                  {post.category.name}
                </p>
              </div>
              <div className="shrink-0">{getStatusBadge(post.status)}</div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                조회 {post.views} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/blog/${post.category.slug}/${post.slug}`}
                  target="_blank"
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  보기
                </Link>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={() => onDelete(post.id, post.title)}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크탑: 테이블 */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">제목</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">조회수</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">작성일</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">/{post.category.slug}/{post.slug}</div>
                      </div>
                      {post.featured && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
                    {post.category.name}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{post.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/blog/${post.category.slug}/${post.slug}`} target="_blank" className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">보기</Link>
                      <Link href={`/admin/posts/${post.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">수정</Link>
                      <button onClick={() => onDelete(post.id, post.title)} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            이전
          </button>

          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            {page + 1} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
