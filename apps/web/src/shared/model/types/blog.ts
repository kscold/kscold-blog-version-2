export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent?: string | null;
  ancestors: string[];
  depth: number;
  order: number;
  icon?: string | null;
  color?: string | null;
  restricted?: boolean | null;
  postCount: number;
  children?: Category[];
  createdAt: string | null;
  updatedAt: string | null;
}

interface PostFields {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  author: {
    id: string;
    name: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  source?: 'MANUAL' | 'MARKDOWN_IMPORT' | null;
  originalFilename?: string | null;
  featured: boolean;
  publicOverride?: boolean | null;
  views: number;
  likes: number;
  seo?: {
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string[] | null;
  } | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Post =
  | (PostFields & { content: string; restricted?: boolean | null })
  | (PostFields & { content: null; restricted: true });

export type PostSummary = PostFields & {
  content: null;
  restricted?: boolean | null;
};

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  categoryId: string | null;
  createdAt: string;
}

export interface TagUsage {
  id: string | null;
  name: string;
  slug: string | null;
  categoryId: string | null;
  categoryName: string | null;
  postCount: number;
  publicPostCount?: number | null;
  feedCount: number;
  totalCount: number;
  unregistered: boolean;
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
  publicOverride?: boolean;
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
  publicOverride?: boolean;
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
