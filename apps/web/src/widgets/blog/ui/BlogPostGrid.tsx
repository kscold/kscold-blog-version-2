'use client';

import { Pagination } from '@/shared/ui/Pagination';
import { CategoryFilter } from './CategoryFilter';
import { ArchivePagination } from './ArchivePagination';
import { BlogPostResults } from './BlogPostResults';
import type { PostSummary, Category } from '@/shared/model/types/blog';

interface BlogPostGridProps {
  posts: PostSummary[];
  totalPages: number;
  page: number;
  isArchive: boolean;
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
  isArchive,
  isLoading,
  searchQuery,
  selectedCategory,
  categories,
  onPageChange,
  onCategoryChange,
}: BlogPostGridProps) {
  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      <BlogPostResults posts={posts} isLoading={isLoading} searchQuery={searchQuery} />
      {!isLoading &&
        posts.length > 0 &&
        (isArchive ? (
          <ArchivePagination
            basePath="/blog"
            page={page + 1}
            totalPages={totalPages}
            ariaLabel="블로그 페이지"
          />
        ) : (
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        ))}
    </>
  );
}
