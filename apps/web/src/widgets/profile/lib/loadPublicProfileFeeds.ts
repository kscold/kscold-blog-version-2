import type { PageResponse } from '@/shared/model/types/api';
import type { Feed } from '@/shared/model/types/social';
import { fetchPublicApi, isIndexableFeed } from '@/shared/lib/seo';
import { toProfileFeedPage, type ProfileFeedPage } from '@/features/profile';

const PROFILE_FEED_PAGE_SIZE = 12;
const PROFILE_FEED_TIMEOUT_MS = 1_800;

export interface PublicProfileFeedSnapshot {
  initialPage: ProfileFeedPage;
  indexableFeedIds: string[];
}

export async function loadPublicProfileFeeds(
  username: string
): Promise<PublicProfileFeedSnapshot | null> {
  const query = new URLSearchParams({ page: '0', size: String(PROFILE_FEED_PAGE_SIZE) });

  try {
    const feedPage = await fetchPublicApi<PageResponse<Feed>>(
      `/users/${encodeURIComponent(username)}/feeds?${query.toString()}`,
      300,
      { timeoutMs: PROFILE_FEED_TIMEOUT_MS }
    );
    if (!feedPage) {
      return null;
    }

    const initialPage = toProfileFeedPage(feedPage);
    const indexableFeedIds = Array.from(
      new Set(
        feedPage.content
          .filter(
            feed =>
              feed.visibility === 'PUBLIC' &&
              typeof feed.id === 'string' &&
              feed.id.length > 0 &&
              isIndexableFeed(feed.content)
          )
          .map(feed => feed.id)
      )
    );

    return { initialPage, indexableFeedIds };
  } catch {
    return null;
  }
}
