'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePosts, usePostsByCategory, useSearchPosts } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { PostCard } from '@/components/blog/PostCard';

export default function BlogPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data: allPostsData, isLoading: isLoadingAll } = usePosts({
    page,
    size: 12,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
  });

  const { data: categoryPostsData, isLoading: isLoadingCategory } = usePostsByCategory(
    selectedCategory || '',
    page,
    12
  );

  const { data: searchResults, isLoading: isSearching } = useSearchPosts(searchQuery, page, 12);

  const displayData = searchQuery
    ? searchResults
    : selectedCategory
      ? categoryPostsData
      : allPostsData;
  const posts = displayData?.content || [];
  const totalPages = displayData?.totalPages || 0;
  const isLoading = isLoadingAll || isLoadingCategory;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <h1 className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-surface-900 mb-6">
            Archive.
          </h1>
          <p className="text-lg text-surface-500 font-medium">
            개발하면서 배우고 느낀 것들을 기록합니다.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="포스트 검색..."
              className="w-full px-6 py-4 pr-12 bg-white border border-surface-200 rounded-2xl text-surface-900 placeholder-surface-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </motion.div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <motion.div
            className="mb-12 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
          >
            <button
              onClick={() => handleCategoryClick(null)}
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
                  onClick={() => handleCategoryClick(category.id)}
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
        {isLoading || isSearching ? (
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
                  className="px-4 py-2 rounded-xl bg-white border border-surface-200 text-surface-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 transition-all font-medium"
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
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-xl bg-white border border-surface-200 text-surface-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 transition-all font-medium"
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
      </div>
    </div>
  );
}
