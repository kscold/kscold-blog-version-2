'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAdminPosts, useDeletePost } from '@/hooks/usePosts';

export default function AdminPostsPage() {
  const [page, setPage] = useState(0);
  const { data: postsData, isLoading } = useAdminPosts(page, 20);
  const deletePost = useDeletePost();

  const posts = postsData?.content || [];
  const totalPages = postsData?.totalPages || 0;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePost.mutateAsync(id);
      alert('포스트가 삭제되었습니다.');
    } catch (error: any) {
      alert(`에러: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">
              포스트 관리
            </h1>
            <div className="flex gap-3">
              <Link
                href="/admin/posts/import"
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Markdown 가져오기
              </Link>
              <Link
                href="/admin/posts/new"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                새 포스트 작성
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          제목
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          카테고리
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          조회수
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          작성일
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {posts.map(post => (
                        <tr
                          key={post.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {post.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  /{post.category.slug}/{post.slug}
                                </div>
                              </div>
                              {post.featured && (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {post.category.icon && (
                              <span className="mr-1">{post.category.icon}</span>
                            )}
                            {post.category.name}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {post.views}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/blog/${post.category.slug}/${post.slug}`}
                                target="_blank"
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              >
                                보기
                              </Link>
                              <Link
                                href={`/admin/posts/${post.id}/edit`}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                              >
                                수정
                              </Link>
                              <button
                                onClick={() => handleDelete(post.id, post.title)}
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    이전
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {page + 1} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg">
              <div className="text-6xl mb-4">📝</div>
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
          )}
        </motion.div>
      </div>
    </div>
  );
}
