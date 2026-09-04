'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCategories } from '@/entities/category';
import { usePostsByCategory } from '@/entities/post';
import { PostCard } from '@/entities/post';
import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post } from '@/shared/model/types/blog';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { CategoryHeader } from './CategoryHeader';
import { Pagination } from '@/shared/ui/Pagination';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

interface CategoryPostContainerProps {
  category: Category;
  initialPosts?: PageResponse<Post>;
  initialCategories?: Category[];
}

export function CategoryPostContainer({
  category,
  initialPosts,
  initialCategories,
}: CategoryPostContainerProps) {
  const [page, setPage] = useState(0);
  const { allowRichEffects } = usePerformanceMode();

  // 서버에서 이미 category(id 포함)를 받아왔으므로, 클라이언트에서 전체 카테고리 목록이
  // 내려올 때까지 기다리지 않고 바로 게시글을 조회한다. useCategories는 하위 카테고리
  // 표시용으로만 병렬로 쓰인다.
  const { data: postsData, isLoading } = usePostsByCategory({
    categoryId: category.id,
    page,
    size: 12,
    initialData: page === 0 ? initialPosts : undefined,
  });
  const { data: categories } = useCategories(initialCategories);

  const posts = postsData?.content || [];
  const totalPages = postsData?.totalPages || 0;

  const subcategories = categories?.filter(cat => cat.parent === category.id) || [];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryHeader category={category} subcategories={subcategories} />

        {/* 포스트 그리드 */}
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

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
