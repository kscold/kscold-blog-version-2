'use client';

import { FeedEditor } from '@/features/feed';
import { useFeedEdit } from '@/features/feed';
import { AdminEditorSkeleton } from '@/shared/ui/RouteSkeletons';

interface FeedEditEditorProps {
  feedId: string;
}

export function FeedEditEditor({ feedId }: FeedEditEditorProps) {
  const { initialData, isLoading, notFound } = useFeedEdit(feedId);

  if (isLoading) {
    return <AdminEditorSkeleton />;
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
      feedId={feedId}
      initialContent={initialData.content}
      initialImages={initialData.images}
      initialVisibility={initialData.visibility}
      initialLinkUrl={initialData.linkUrl}
    />
  );
}
