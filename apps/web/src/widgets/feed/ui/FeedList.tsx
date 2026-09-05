'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeeds } from '@/entities/feed';
import { FeedCard } from '@/features/feed';
import { FeedComposer } from './FeedComposer';
import { useAuth } from '@/features/auth';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Pagination } from '@/shared/ui/Pagination';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';
import { isIndexableFeed } from '@/shared/lib/seo/indexability';
import type { PageResponse } from '@/shared/model/types/api';
import type { Feed } from '@/shared/model/types/social';

interface FeedListProps {
  initialFeeds?: PageResponse<Feed>;
}

export function FeedList({ initialFeeds }: FeedListProps = {}) {
  const { currentUser } = useAuth();
  const { allowRichEffects } = usePerformanceMode();
  const [page, setPage] = useState(0);

  const { data: feedsData, isLoading } = useFeeds({
    page,
    size: 12,
    initialData: page === 0 ? initialFeeds : undefined,
  });

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
          <p className="text-sm text-surface-500">
            첫 번째 피드를 작성해보세요!
          </p>
        </div>
      </div>
    );
  }

  // 목록에 분량 있는 피드가 하나도 없으면 광고를 붙이지 않는다(단문만 나열된 화면 방지).
  const hasAdworthyContent = feeds.some(item => isIndexableFeed(item.content));

  return (
    <>
      {hasAdworthyContent && <AdSenseScript />}
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
