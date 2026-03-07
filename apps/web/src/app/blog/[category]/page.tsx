'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCategories } from '@/entities/category/api/useCategories';
import { usePostsByCategory } from '@/entities/post/api/usePosts';
import { PostCard } from '@/entities/post/ui/PostCard';
import Link from 'next/link';
import { CategoryHeader } from '@/widgets/blog/ui/CategoryHeader';

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
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black text-surface-900 mb-2">
            카테고리를 찾을 수 없습니다
          </h1>
          <Link href="/blog" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const subcategories = categories?.filter(cat => cat.parent === category.id) || [];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryHeader category={category} subcategories={subcategories} />

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-white border border-surface-200 rounded-2xl animate-pulse"
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
                  className="px-4 py-2 rounded-lg bg-white border border-surface-200 text-surface-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-surface-900 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                          ? 'bg-surface-900 text-white'
                          : 'bg-white border border-surface-200 text-surface-600 hover:border-surface-900'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-white border border-surface-200 text-surface-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-surface-900 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-surface-900 mb-2">
              아직 포스트가 없습니다
            </h2>
            <p className="text-surface-500 mb-6">
              이 카테고리에는 작성된 포스트가 없습니다.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white rounded-lg hover:bg-surface-700 transition-colors font-medium"
            >
              모든 포스트 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
