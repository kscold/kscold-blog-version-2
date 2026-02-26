export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  ancestors: string[];
  depth: number;
  order: number;
  icon?: string;
  color?: string;
  postCount: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
  author: {
    id: string;
    name: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  source?: 'MANUAL' | 'MARKDOWN_IMPORT';
  originalFilename?: string;
  featured: boolean;
  views: number;
  likes: number;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PostCreateRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId: string;
  tagIds?: string[];
  status?: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  source?: 'MANUAL' | 'MARKDOWN_IMPORT';
  originalFilename?: string;
}

export interface PostUpdateRequest {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface CategoryCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  parent?: string;
  order?: number;
  icon?: string;
  color?: string;
}

export interface CategoryUpdateRequest {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  icon?: string;
  color?: string;
}

// Feed
export interface Feed {
  id: string;
  content: string;
  images: string[];
  author: {
    id: string;
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
  authorName: string;
  authorPassword: string;
  content: string;
}

// Vault
export interface VaultNote {
  id: string;
  title: string;
  slug: string;
  content: string;
  folderId: string;
  author: {
    id: string;
    name: string;
  };
  outgoingLinks: string[];
  tags: string[];
  views: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  depth: number;
  order: number;
  noteCount: number;
  children?: VaultFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphNode {
  id: string;
  name: string;
  slug: string;
  size: number;
  folderId?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface VaultNoteCreateRequest {
  title: string;
  slug?: string;
  content: string;
  folderId: string;
  tags?: string[];
}

export interface VaultNoteUpdateRequest {
  title?: string;
  slug?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface VaultNoteComment {
  id: string;
  noteId: string;
  authorName: string;
  isAdmin: boolean;
  content: string;
  createdAt: string;
}
