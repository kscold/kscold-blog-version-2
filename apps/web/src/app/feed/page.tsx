'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { FeedCard } from '@/entities/feed/ui/FeedCard';
import { Pagination } from '@/shared/ui/Pagination';

export default function FeedPage() {
  const [page, setPage] = useState(0);

  const { data: feedsData, isLoading } = useFeeds({ page, size: 12 });

  const feeds = feedsData?.content || [];
  const totalPages = feedsData?.totalPages || 0;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-sans font-black tracking-tighter text-surface-900 mb-2">
            Feed
          </h1>
          <p className="text-sm text-surface-500 font-medium">일상, 개발, 그리고 생각의 조각들</p>
        </motion.div>

        {/* Feed Timeline */}
        {isLoading ? (
          <div className="space-y-6">
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
        ) : feeds.length > 0 ? (
          <>
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

            {/* Pagination */}
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-black tracking-tight text-surface-900 mb-2">
              아직 피드가 없습니다
            </h2>
            <p className="text-sm text-surface-500">곧 새로운 이야기로 찾아올게요</p>
          </div>
        )}
      </div>
    </div>
  );
}
