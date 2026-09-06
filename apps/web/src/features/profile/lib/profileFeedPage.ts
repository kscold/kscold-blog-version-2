import type { PageResponse } from '@/shared/model/types/api';
import type { Feed } from '@/shared/model/types/social';
import { toFeedPreview, type FeedPreview } from '@/shared/lib/seo/text';

type ProfileFeedFields = Pick<
  Feed,
  | 'id'
  | 'images'
  | 'tags'
  | 'linkPreview'
  | 'likesCount'
  | 'commentsCount'
  | 'isLiked'
  | 'createdAt'
> & {
  author: Pick<Feed['author'], 'username' | 'name' | 'avatar'>;
};

export type ProfileFeed = ProfileFeedFields & {
  preview: FeedPreview;
};

export interface ProfileFeedPage {
  content: ProfileFeed[];
  totalPages: number;
}

export function toProfileFeedPage(page: PageResponse<Feed>): ProfileFeedPage {
  if (!Array.isArray(page.content) || !Number.isInteger(page.totalPages) || page.totalPages < 0) {
    throw new Error('프로필 피드 페이지 응답이 올바르지 않습니다.');
  }

  return {
    content: page.content
      .filter(feed => feed.visibility === 'PUBLIC')
      .map(feed => ({
        id: feed.id,
        images: feed.images,
        tags: feed.tags,
        author: {
          username: feed.author.username,
          name: feed.author.name,
          avatar: feed.author.avatar,
        },
        linkPreview: feed.linkPreview,
        likesCount: feed.likesCount,
        commentsCount: feed.commentsCount,
        isLiked: feed.isLiked,
        createdAt: feed.createdAt,
        preview: toFeedPreview(feed.content),
      })),
    totalPages: page.totalPages,
  };
}
