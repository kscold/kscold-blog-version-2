'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFeed } from '@/hooks/useFeeds';
import { FeedCard } from '@/components/feed/FeedCard';
import { CommentSection } from '@/components/feed/CommentSection';

export default function FeedDetailPage() {
  const params = useParams();
  const feedId = params.id as string;
  const { data: feed, isLoading } = useFeed(feedId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-surface-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-surface-900 mb-2">피드를 찾을 수 없습니다</h2>
          <Link
            href="/feed"
            className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
          >
            피드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            피드로 돌아가기
          </Link>
        </motion.div>

        {/* Feed */}
        <FeedCard feed={feed} showCommentLink={false} />

        {/* Comments */}
        <motion.div
          className="mt-4 bg-white border border-surface-200 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="text-sm font-bold text-surface-900 mb-4">댓글 {feed.commentsCount}개</h3>
          <CommentSection feedId={feedId} />
        </motion.div>
      </div>
    </div>
  );
}
