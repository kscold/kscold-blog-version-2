'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/entities/post';
import type { PostSummary } from '@/shared/model/types/blog';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

interface BlogPostResultsProps {
  posts: PostSummary[];
  isLoading: boolean;
  searchQuery: string;
}

export function BlogPostResults({ posts, isLoading, searchQuery }: BlogPostResultsProps) {
  if (isLoading) return <BlogPostSkeleton />;
  if (posts.length === 0) return <BlogPostEmptyState hasSearch={Boolean(searchQuery)} />;
  return (
    <>
      <AdSenseScript />
      <BlogPostCards posts={posts} />
    </>
  );
}

function BlogPostCards({ posts }: { posts: PostSummary[] }) {
  const { allowRichEffects } = usePerformanceMode();
  const gridVariants = allowRichEffects
    ? { visible: { transition: { staggerChildren: 0.1 } } }
    : undefined;
  const cardVariants = allowRichEffects
    ? { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
    : undefined;

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
      initial={allowRichEffects ? 'hidden' : false}
      animate={allowRichEffects ? 'visible' : undefined}
      variants={gridVariants}
    >
      {posts.map(post => (
        <motion.div
          key={post.id}
          variants={cardVariants}
          transition={allowRichEffects ? { duration: 0.5 } : undefined}
        >
          <PostCard post={post} headingLevel={2} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function BlogPostSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-96 bg-surface-50 border border-surface-100 rounded-[24px] animate-pulse"
        />
      ))}
    </div>
  );
}

function BlogPostEmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-24">
      <h2 className="text-2xl font-black tracking-tight text-surface-900 mb-2">
        포스트가 없습니다
      </h2>
      <p className="text-surface-500 font-medium">
        {hasSearch
          ? '검색 결과가 없습니다. 다른 검색어를 시도해보세요.'
          : '아직 작성된 포스트가 없습니다.'}
      </p>
    </div>
  );
}
