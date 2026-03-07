'use client';

import { useParams } from 'next/navigation';
import { useFeed } from '@/entities/feed/api/useFeeds';
import FeedEditor from '@/widgets/feed/ui/FeedEditor';

export default function EditFeedPage() {
  const { id } = useParams<{ id: string }>();
  const { data: feed, isLoading } = useFeed(id);

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
        <p className="text-surface-500">피드를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <FeedEditor
      feedId={id}
      initialContent={feed.content || ''}
      initialImages={feed.images || []}
      initialVisibility={feed.visibility || 'PUBLIC'}
      initialLinkUrl={feed.linkPreview?.url || ''}
    />
  );
}
