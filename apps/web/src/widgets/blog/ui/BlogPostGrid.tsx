'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/entities/post/ui/PostCard';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Pagination } from '@/shared/ui/Pagination';
import { CategoryFilter } from './CategoryFilter';
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
  const { allowRichEffects } = usePerformanceMode();

  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* 포스트 그리드 */}
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
            initial={allowRichEffects ? 'hidden' : false}
            animate={allowRichEffects ? 'visible' : undefined}
            variants={allowRichEffects ? {
              visible: { transition: { staggerChildren: 0.1 } },
            } : undefined}
          >
            {posts.map(post => (
              <motion.div
                key={post.id}
                variants={allowRichEffects ? {
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                } : undefined}
                transition={allowRichEffects ? { duration: 0.5 } : undefined}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>

          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
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
