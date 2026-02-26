'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { usePostsByCategory } from '@/hooks/usePosts';
import { PostCard } from '@/components/blog/PostCard';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [page, setPage] = useState(0);

  const { data: categories } = useCategories();
  const category = categories?.find(cat => cat.slug === categorySlug);

  const { data: postsData, isLoading } = usePostsByCategory(category?.id || '', page, 12);

  const posts = postsData?.content || [];
  const totalPages = postsData?.totalPages || 0;

  if (!category) {
    return (
      <div className="min-h-screen bg-secondary-beige dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            카테고리를 찾을 수 없습니다
          </h1>
          <Link href="/blog" className="text-purple-600 dark:text-purple-400 hover:underline">
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <motion.nav
          className="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/blog"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{category.name}</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <h1 className="text-5xl font-serif font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              {category.description}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {category.postCount}개의 포스트
          </div>
        </motion.div>

        {/* Subcategories */}
        {categories && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {(() => {
              const subcategories = categories.filter(cat => cat.parent === category.id);

              if (subcategories.length === 0) return null;

              return (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    하위 카테고리
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {subcategories.map(subcat => (
                      <Link
                        key={subcat.id}
                        href={`/blog/${subcat.slug}`}
                        className="px-4 py-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-600 dark:hover:border-purple-400 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {subcat.icon && <span className="mr-1">{subcat.icon}</span>}
                        {subcat.name}
                        <span className="ml-2 text-xs text-gray-400">({subcat.postCount})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-[20px] animate-pulse"
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {posts.map(post => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(0, Math.min(page - 2 + i, totalPages - (5 - i)));
                  if (pageNum < 0 || pageNum >= totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              아직 포스트가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              이 카테고리에는 작성된 포스트가 없습니다.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              모든 포스트 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
