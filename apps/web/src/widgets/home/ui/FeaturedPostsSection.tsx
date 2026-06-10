'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeaturedPosts } from '@/entities/post/api/usePosts';
import { PostCard } from '@/entities/post/ui/PostCard';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function FeaturedPostsSection() {
  const { allowRichEffects } = usePerformanceMode();
  const { data: featuredPosts, isLoading } = useFeaturedPosts(3);

  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 lg:px-8 bg-surface-50 relative border-t border-surface-200">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex items-end justify-between mb-10 sm:mb-20 border-b border-surface-200 pb-6 sm:pb-8"
          initial={allowRichEffects ? { opacity: 0, y: 20 } : false}
          whileInView={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          viewport={allowRichEffects ? { once: true } : undefined}
          transition={allowRichEffects ? { duration: 0.6 } : undefined}
        >
          <div>
            <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-surface-400">
              <span className="font-mono text-surface-300">01</span>
              <span className="h-px w-8 bg-surface-300" aria-hidden="true" />
              Featured
            </p>
            <h2 className="text-3xl sm:text-5xl font-sans font-black text-surface-900 mb-2 tracking-tight">
              Featured <span className="text-accent-dark">Posts</span>
            </h2>
            <p className="text-sm sm:text-base text-surface-500">최근 1달 기준 조회수 TOP 3</p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-1.5 text-surface-500 hover:text-surface-900 transition-colors uppercase text-xs sm:text-sm tracking-widest font-bold"
          >
            전체 보기
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 sm:h-96 bg-white/50 border border-surface-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : featuredPosts && featuredPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
            initial={allowRichEffects ? 'hidden' : false}
            whileInView={allowRichEffects ? 'visible' : undefined}
            viewport={allowRichEffects ? { once: true } : undefined}
            variants={allowRichEffects ? {
              visible: { transition: { staggerChildren: 0.1 } },
            } : undefined}
          >
            {featuredPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={allowRichEffects ? {
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                } : undefined}
                transition={allowRichEffects ? { duration: 0.4 } : undefined}
              >
                <PostCard post={post} />
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
