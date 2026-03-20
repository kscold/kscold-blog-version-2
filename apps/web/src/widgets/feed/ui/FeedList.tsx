'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { FeedCard } from '@/entities/feed/ui/FeedCard';
import { FeedComposer } from '@/features/feed/ui/FeedComposer';
import { useAuth } from '@/features/auth/api/useAuth';
import { Pagination } from '@/shared/ui/Pagination';

export function FeedList() {
  const { currentUser } = useAuth();
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
            className="bg-white border border-surface-200 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-surface-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-surface-100 rounded w-3/4" />
              <div className="h-4 bg-surface-100 rounded w-1/2" />
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
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {feeds.map(feed => (
          <motion.div
            key={feed.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
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
