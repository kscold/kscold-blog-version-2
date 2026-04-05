'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { FeedCard } from '@/entities/feed/ui/FeedCard';
import { FeedComposer } from '@/features/feed/ui/FeedComposer';
import { useAuth } from '@/features/auth/api/useAuth';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Pagination } from '@/shared/ui/Pagination';

export function FeedList() {
  const { currentUser } = useAuth();
  const { allowRichEffects } = usePerformanceMode();
  const [page, setPage] = useState(0);

  const { data: feedsData, isLoading } = useFeeds({ page, size: 12 });

  const feeds = feedsData?.content || [];
  const totalPages = feedsData?.totalPages || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FeedComposer currentUser={currentUser ?? null} />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-surface-200 bg-white animate-pulse"
          >
            <div className="h-16 border-b border-surface-100 bg-surface-50" />
            <div className="aspect-[16/10] bg-surface-100" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-2/3 rounded bg-surface-100" />
              <div className="h-4 w-full rounded bg-surface-100" />
              <div className="h-4 w-3/4 rounded bg-surface-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div>
        <FeedComposer currentUser={currentUser ?? null} />
        <div className="text-center py-20">
          <h2 className="text-xl font-black tracking-tight text-surface-900 mb-2">
            아직 피드가 없습니다
          </h2>
          <p className="text-sm text-surface-500">첫 번째 피드를 작성해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FeedComposer currentUser={currentUser ?? null} />

      <motion.div
        className="space-y-6"
        initial={allowRichEffects ? 'hidden' : false}
        animate={allowRichEffects ? 'visible' : undefined}
        variants={allowRichEffects ? {
          visible: {
            transition: { staggerChildren: 0.1 },
          },
        } : undefined}
      >
        {feeds.map(feed => (
          <motion.div
            key={feed.id}
            variants={allowRichEffects ? {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            } : undefined}
            transition={allowRichEffects ? { duration: 0.4 } : undefined}
          >
            <FeedCard feed={feed} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
