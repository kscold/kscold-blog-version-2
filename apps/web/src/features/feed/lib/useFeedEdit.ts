import { useFeed } from '@/entities/feed/api/useFeeds';

export function useFeedEdit(id: string) {
  const { data: feed, isLoading } = useFeed(id);

  const initialData = feed
    ? {
        content: feed.content || '',
        images: feed.images || [],
        visibility: feed.visibility || 'PUBLIC' as const,
        linkUrl: feed.linkPreview?.url || '',
      }
    : null;

  return { initialData, isLoading, notFound: !isLoading && !feed };
}
