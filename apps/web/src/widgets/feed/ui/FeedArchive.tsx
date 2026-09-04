import type { PageResponse } from '@/shared/model/types/api';
import type { Feed } from '@/shared/model/types/social';
import { fetchPublicApi } from '@/shared/lib/seo';
import { FeedList } from './FeedList';

interface FeedArchiveProps {
  activeTag?: string;
}

export async function FeedArchive({ activeTag }: FeedArchiveProps) {
  const params = new URLSearchParams({ page: '0', size: '12' });
  if (activeTag) {
    params.set('tag', activeTag);
  }

  const initialFeeds = await fetchPublicApi<PageResponse<Feed>>(`/feeds?${params.toString()}`);

  return <FeedList initialTag={activeTag} initialFeeds={initialFeeds ?? undefined} />;
}
