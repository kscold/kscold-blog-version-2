'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/entities/post/ui/PostCard';
import { Post, Category } from '@/types/blog';

interface BlogPostGridProps {
  posts: Post[];
  totalPages: number;
  page: number;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  categories: Category[];
  onPageChange: (page: number) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function BlogPostGrid({
  posts,
  totalPages,
  page,
  isLoading,
  searchQuery,
  selectedCategory,
  categories,
  onPageChange,
  onCategoryChange,
}: BlogPostGridProps) {
  return (
    <>
      {/* Category Filter */}
      {categories.length > 0 && (
        <motion.div
          className="mb-12 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
        >
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${
              selectedCategory === null
                ? 'bg-surface-900 text-white shadow-md'
                : 'bg-white text-surface-500 border border-surface-200 hover:border-surface-900 hover:text-surface-900'
            }`}
          >
            전체
          </button>
          {categories
            .filter(cat => cat.depth === 0)
            .map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-surface-900 text-white shadow-md'
                    : 'bg-white text-surface-500 border border-surface-200 hover:border-surface-900 hover:text-surface-900'
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                {category.name}
              </button>
            ))}
        </motion.div>
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-96 bg-surface-50 border border-surface-100 rounded-[24px] animate-pulse"
            />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
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
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl bg-white border border-surface-200 text-surface-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 transition-all font-medium"
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
                    onClick={() => onPageChange(pageNum)}
                    className={`px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                      page === pageNum
                        ? 'bg-surface-900 text-white shadow-sm'
                        : 'bg-white border border-surface-200 text-surface-500 hover:border-surface-900 hover:text-surface-900'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-xl bg-white border border-surface-200 text-surface-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <h2 className="text-2xl font-black tracking-tight text-surface-900 mb-2">
            포스트가 없습니다
          </h2>
          <p className="text-surface-500 font-medium">
            {searchQuery
              ? '검색 결과가 없습니다. 다른 검색어를 시도해보세요.'
              : '아직 작성된 포스트가 없습니다.'}
          </p>
        </div>
      )}
    </>
  );
}
