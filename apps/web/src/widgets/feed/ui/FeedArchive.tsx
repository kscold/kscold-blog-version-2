import type { PageResponse } from '@/shared/model/types/api';
import type { Feed } from '@/shared/model/types/social';
import { fetchPublicApi } from '@/shared/lib/seo';
import { FeedList } from './FeedList';

export async function FeedArchive() {
  const params = new URLSearchParams({ page: '0', size: '12' });

  // 새 글이 서버 목록 캐시에 가려지지 않도록 첫 페이지는 요청마다 조회한다.
  const initialFeeds = await fetchPublicApi<PageResponse<Feed>>(`/feeds?${params.toString()}`, 0);

  return <FeedList initialFeeds={initialFeeds ?? undefined} />;
}
