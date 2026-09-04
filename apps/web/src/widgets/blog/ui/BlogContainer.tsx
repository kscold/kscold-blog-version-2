'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePosts, usePostsByCategory, useSearchPosts } from '@/entities/post';
import { useCategories } from '@/entities/category';
import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post } from '@/shared/model/types/blog';
import BlogPostGrid from './BlogPostGrid';

interface BlogContainerProps {
  initialPosts?: PageResponse<Post>;
  initialCategories?: Category[];
}

export function BlogContainer({ initialPosts, initialCategories }: BlogContainerProps) {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 검색어 디바운스 처리 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories } = useCategories(initialCategories);
  const { data: allPostsData, isLoading: isLoadingAll } = usePosts({
    page,
    size: 12,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
    initialData: page === 0 ? initialPosts : undefined,
  });

  const { data: categoryPostsData, isLoading: isLoadingCategory } = usePostsByCategory({
    categoryId: selectedCategory || '',
    page,
    size: 12,
  });

  const { data: searchResults, isLoading: isSearching } = useSearchPosts(debouncedQuery, page, 12);

  const displayData = debouncedQuery
    ? searchResults
    : selectedCategory
      ? categoryPostsData
      : allPostsData;
  const posts = displayData?.content || [];
  const totalPages = displayData?.totalPages || 0;
  const isLoading = isLoadingAll || isLoadingCategory || isSearching;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  return (
    <>
      {/* 검색 바 */}
      <motion.div
        className="mb-12"
        initial={false}
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
            aria-label="포스트 검색"
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

      <BlogPostGrid
        posts={posts}
        totalPages={totalPages}
        page={page}
        isLoading={isLoading}
        searchQuery={debouncedQuery}
        selectedCategory={selectedCategory}
        categories={categories || []}
        onPageChange={setPage}
        onCategoryChange={handleCategoryClick}
      />
    </>
  );
}
