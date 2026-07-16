export interface Feed {
  id: string;
  content: string;
  images: string[];
  tags?: string[];
  author: {
    id: string;
    username?: string;
    name: string;
    avatar?: string;
  };
  visibility: 'PUBLIC' | 'PRIVATE';
  linkPreview?: LinkPreview;
  likesCount: number;
  commentsCount: number;
  views: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface FeedComment {
  id: string;
  feedId: string;
  authorName: string;
  isAdmin: boolean;
  canDelete: boolean;
  content: string;
  createdAt: string;
}

export interface FeedCreateRequest {
  content: string;
  images?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE';
  linkUrl?: string;
}

export interface FeedUpdateRequest {
  content?: string;
  images?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE';
  linkUrl?: string;
}

export interface FeedCommentCreateRequest {
  content: string;
}

/** 댓글 @언급 자동완성 대상(주인 + 해당 글 댓글 참여자) */
export interface MentionableUser {
  username: string;
  displayName: string;
  avatar?: string | null;
  isAdmin: boolean;
}
