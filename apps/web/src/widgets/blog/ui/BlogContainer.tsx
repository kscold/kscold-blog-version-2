'use client';

import { useCategories } from '@/entities/category';
import { useBlogArchiveFilter } from '../model/useBlogArchiveFilter';
import type { BlogArchiveProps } from './BlogArchive';
import BlogPostGrid from './BlogPostGrid';
import { BlogSearchForm } from './BlogSearchForm';

export function BlogContainer({
  page,
  initialPosts,
  initialCategories,
  categoriesDegraded,
}: BlogArchiveProps) {
  const filter = useBlogArchiveFilter(initialPosts);
  const { data: categories } = useCategories(categoriesDegraded ? undefined : initialCategories);
  return (
    <>
      <BlogSearchForm
        query={filter.searchQuery}
        onChange={filter.setSearchQuery}
        onSubmit={() => filter.setFilterPage(0)}
      />

      <BlogPostGrid
        posts={filter.displayData?.content || []}
        totalPages={filter.displayData?.totalPages || 0}
        page={filter.isFiltered ? filter.filterPage : page - 1}
        isArchive={!filter.isFiltered}
        isLoading={filter.isLoading}
        searchQuery={filter.debouncedQuery}
        selectedCategory={filter.selectedCategory}
        categories={categories || []}
        onPageChange={filter.setFilterPage}
        onCategoryChange={filter.handleCategoryChange}
      />
    </>
  );
}
