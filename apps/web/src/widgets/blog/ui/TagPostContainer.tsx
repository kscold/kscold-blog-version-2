'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTags } from '@/entities/tag/api/useTags';
import { usePostsByTag } from '@/entities/post/api/usePosts';
import { PostCard } from '@/entities/post/ui/PostCard';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Pagination } from '@/shared/ui/Pagination';

interface TagPostContainerProps {
  tagSlug: string;
}

export function TagPostContainer({ tagSlug }: TagPostContainerProps) {
  const [page, setPage] = useState(0);
  const { allowRichEffects } = usePerformanceMode();

  const { data: tags = [] } = useTags();
  const tag = tags.find(
    t => t.name.toLowerCase() === tagSlug.toLowerCase() || t.slug === tagSlug
  );

  const { data: postsData, isLoading } = usePostsByTag(tag?.id || '', page, 12);
  const posts = postsData?.content || [];
  const totalPages = postsData?.totalPages || 0;

  if (!tag && tags.length > 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black text-surface-900 mb-2">
            태그를 찾을 수 없습니다
          </h1>
          <p className="text-surface-500 mb-4">&ldquo;{tagSlug}&rdquo; 태그가 존재하지 않습니다.</p>
          <Link href="/blog" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 브레드크럼 */}
        <motion.nav
          className="mb-8 flex items-center gap-2 text-sm text-surface-500"
          initial={allowRichEffects ? { opacity: 0, y: -10 } : false}
          animate={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          transition={allowRichEffects ? { duration: 0.4 } : undefined}
        >
          <Link href="/blog" className="hover:text-surface-900 transition-colors">
            Blog
          </Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-900 font-medium">#{tag?.name || tagSlug}</span>
        </motion.nav>

        {/* 헤더 */}
        <motion.div
          className="mb-12"
          initial={allowRichEffects ? { opacity: 0, y: 20 } : false}
          animate={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          transition={allowRichEffects ? { duration: 0.6 } : undefined}
        >
          <h1 className="text-5xl font-sans font-black tracking-tight text-surface-900 mb-2">
            #{tag?.name || tagSlug}
          </h1>
          <p className="text-sm text-surface-400">
            {tag?.postCount || 0}개의 포스트
          </p>
        </motion.div>

        {/* 포스트 그리드 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-surface-900 mb-2">
              아직 포스트가 없습니다
            </h2>
            <p className="text-surface-500 mb-6">
              이 태그에는 작성된 포스트가 없습니다.
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
