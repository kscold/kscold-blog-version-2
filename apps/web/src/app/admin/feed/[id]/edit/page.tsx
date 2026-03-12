'use client';

import { useParams } from 'next/navigation';
import FeedEditor from '@/features/feed/ui/FeedEditor';
import { useFeedEdit } from '@/features/feed/lib/useFeedEdit';

export default function EditFeedPage() {
  const { id } = useParams<{ id: string }>();
  const { initialData, isLoading, notFound } = useFeedEdit(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-surface-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !initialData) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <p className="text-surface-500">피드를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <FeedEditor
      feedId={id}
      initialContent={initialData.content}
      initialImages={initialData.images}
      initialVisibility={initialData.visibility}
      initialLinkUrl={initialData.linkUrl}
    />
  );
}
