'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFeeds } from '@/entities/feed';
import { FeedCard } from '@/features/feed';
import { FeedComposer } from './FeedComposer';
import { useAuth } from '@/features/auth';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Pagination } from '@/shared/ui/Pagination';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';
import { MIN_INDEXABLE_CONTENT_LENGTH } from '@/shared/lib/seo/constants';

interface FeedListProps {
  initialTag?: string;
}

export function FeedList({ initialTag }: FeedListProps = {}) {
  const { currentUser } = useAuth();
  const { allowRichEffects } = usePerformanceMode();
  const [page, setPage] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag') ?? initialTag ?? undefined;

  const { data: feedsData, isLoading } = useFeeds({ page, size: 12, tag: activeTag });

  const feeds = feedsData?.content || [];
  const totalPages = feedsData?.totalPages || 0;

  const clearTag = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    router.push(`/feed${params.toString() ? `?${params.toString()}` : ''}`);
  };

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
            {activeTag ? `#${activeTag} 피드가 없습니다` : '아직 피드가 없습니다'}
          </h2>
          <p className="text-sm text-surface-500">
            {activeTag ? '다른 태그를 선택해보세요.' : '첫 번째 피드를 작성해보세요!'}
          </p>
        </div>
      </div>
    );
  }

  // 목록에 분량 있는 피드가 하나도 없으면 광고를 붙이지 않는다(단문만 나열된 화면 방지).
  const hasAdworthyContent = feeds.some(
    item => (item.content?.trim().length ?? 0) >= MIN_INDEXABLE_CONTENT_LENGTH
  );

  return (
    <>
      {hasAdworthyContent && <AdSenseScript />}
      <FeedComposer currentUser={currentUser ?? null} />

      {activeTag && (
        <div className="flex items-center gap-2 my-4">
          <span className="text-xs text-surface-500 font-medium">필터:</span>
          <button
            onClick={clearTag}
            className="flex items-center gap-1 px-3 py-1 bg-surface-900 text-white text-xs font-bold rounded-full hover:bg-surface-700 transition-colors"
          >
            #{activeTag}
            <span className="ml-1 opacity-70">×</span>
          </button>
        </div>
      )}

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
