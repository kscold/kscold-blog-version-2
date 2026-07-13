'use client';

import { FeedCard } from '@/features/feed';
import type { PageResponse } from '@/shared/model/types/api';
import type { Feed } from '@/shared/model/types/social';

interface Props {
  feedsData?: PageResponse<Feed>;
  feedsLoading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function ProfileFeedList({ feedsData, feedsLoading, page, setPage }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-4">게시물</h2>
      {feedsLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-surface-300 border-t-surface-800 rounded-full animate-spin" />
        </div>
      ) : feedsData?.content && feedsData.content.length > 0 ? (
        <div className="space-y-4">
          {feedsData.content.map(feed => (
            <FeedCard key={feed.id} feed={feed} showCommentLink />
          ))}
          {/* 페이지네이션 */}
          {(feedsData.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm text-surface-600 border border-surface-200 rounded-lg disabled:opacity-40 hover:bg-surface-50 transition-colors"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm text-surface-500">
                {page + 1} / {feedsData.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page + 1 >= (feedsData.totalPages ?? 1)}
                className="px-4 py-2 text-sm text-surface-600 border border-surface-200 rounded-lg disabled:opacity-40 hover:bg-surface-50 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-surface-400 py-12 text-sm">아직 게시물이 없습니다.</p>
      )}
    </div>
  );
}
