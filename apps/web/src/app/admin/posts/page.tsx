'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PostsTable } from '@/widgets/admin/ui/PostsTable';
import { useAdminPosts } from '@/features/admin/lib/useAdminPosts';

export default function AdminPostsPage() {
  const { posts, totalPages, page, setPage, isLoading, handleDelete } = useAdminPosts();

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
