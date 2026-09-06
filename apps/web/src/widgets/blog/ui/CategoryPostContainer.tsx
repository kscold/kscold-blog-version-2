'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCategories } from '@/entities/category';
import { PostCard } from '@/entities/post';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { CategoryHeader } from './CategoryHeader';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';
import type { CategoryArchiveData } from '../lib/loadCategoryArchive';
import { ArchivePagination } from './ArchivePagination';

export function CategoryPostContainer({
  page,
  basePath,
  category,
  initialPosts,
  initialCategories,
  categoriesDegraded,
}: CategoryArchiveData) {
  const { allowRichEffects } = usePerformanceMode();
  const { data: categories } = useCategories(
    categoriesDegraded ? undefined : initialCategories
  );
  const posts = initialPosts.content;
  const subcategories = categories?.filter(cat => cat.parent === category.id) || [];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryHeader
          category={category}
          subcategories={subcategories}
          postCount={initialPosts.totalElements}
        />

        {/* 포스트 그리드 */}
        {posts.length > 0 ? (
          <>
            <AdSenseScript />
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={allowRichEffects ? 'hidden' : false}
              animate={allowRichEffects ? 'visible' : undefined}
              variants={allowRichEffects ? {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
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
                  <PostCard post={post} headingLevel={2} />
                </motion.div>
              ))}
            </motion.div>

            <ArchivePagination
              basePath={basePath}
              page={page}
              totalPages={initialPosts.totalPages}
              ariaLabel={`${category.name} 카테고리 페이지`}
            />
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
