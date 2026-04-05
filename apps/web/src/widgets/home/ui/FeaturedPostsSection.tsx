'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeaturedPosts } from '@/entities/post/api/usePosts';
import { PostCard } from '@/entities/post/ui/PostCard';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function FeaturedPostsSection() {
  const { allowRichEffects } = usePerformanceMode();
  const { data: featuredPosts, isLoading } = useFeaturedPosts(6);

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-50 relative border-t border-surface-200">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex items-end justify-between mb-20 border-b border-white/10 pb-8"
          initial={allowRichEffects ? { opacity: 0, y: 20 } : false}
          whileInView={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          viewport={allowRichEffects ? { once: true } : undefined}
          transition={allowRichEffects ? { duration: 0.6 } : undefined}
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-sans font-bold text-surface-900 mb-2 tracking-tight">
              Featured <span className="text-accent-dark">Posts</span>
            </h2>
            <p className="text-surface-500">엄선된 개발 이야기</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:block text-surface-500 hover:text-surface-900 transition-colors uppercase text-sm tracking-widest font-bold"
          >
            전체 보기
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-white/50 border border-surface-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : featuredPosts && featuredPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={allowRichEffects ? 'hidden' : false}
            whileInView={allowRichEffects ? 'visible' : undefined}
            viewport={allowRichEffects ? { once: true } : undefined}
            variants={allowRichEffects ? {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            } : undefined}
          >
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                variants={allowRichEffects ? {
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                } : undefined}
                transition={allowRichEffects ? { duration: 0.5 } : undefined}
              >
                <PostCard post={post} featured={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 border border-surface-200 border-dashed rounded-3xl bg-white">
            <p className="text-lg text-surface-500 font-mono">작성된 포스트가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
