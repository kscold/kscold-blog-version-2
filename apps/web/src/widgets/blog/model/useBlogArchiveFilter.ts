'use client';

import { useEffect, useState } from 'react';
import { usePostsByCategory, useSearchPosts } from '@/entities/post';
import { normalizePublicSearchQuery } from '@/shared/lib/search';
import type { PageResponse } from '@/shared/model/types/api';
import type { Post } from '@/shared/model/types/blog';

export function useBlogArchiveFilter(initialPosts: PageResponse<Post>) {
  const [filterPage, setFilterPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(normalizePublicSearchQuery(searchQuery));
      setFilterPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const category = usePostsByCategory({
    categoryId:
      debouncedQuery || normalizePublicSearchQuery(searchQuery) ? '' : selectedCategory || '',
    page: filterPage,
    size: 12,
  });
  const search = useSearchPosts(debouncedQuery, filterPage, 12);
  const isFiltered = Boolean(debouncedQuery || selectedCategory);
  const result = debouncedQuery ? search : category;
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setFilterPage(0);
  };

  return {
    filterPage,
    setFilterPage,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    selectedCategory,
    handleCategoryChange,
    isFiltered,
    displayData: isFiltered ? result.data : initialPosts,
    isLoading: isFiltered && result.isLoading,
  };
}
