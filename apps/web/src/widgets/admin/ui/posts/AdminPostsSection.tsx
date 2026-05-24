'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PostsTable } from './PostsTable';
import { useAdminPosts } from '../api/useAdminPosts';

export function AdminPostsSection() {
  const { posts, totalPages, page, setPage, isLoading, handleDelete } = useAdminPosts();

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white sm:text-4xl">
                포스트 관리
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                발행 상태와 작성 흐름을 한곳에서 살펴보고, 새 글 작성이나 Markdown 가져오기를 바로 이어갈 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Link
                href="/admin/posts/import"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:flex-none sm:px-6 sm:py-3"
              >
                MD 가져오기
              </Link>
              <Link
                href="/admin/posts/new"
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white transition-all hover:shadow-lg sm:flex-none sm:px-6 sm:py-3"
              >
                새 포스트
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <PostsTable
              posts={posts}
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
