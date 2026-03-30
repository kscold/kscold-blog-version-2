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
  restricted?: boolean;
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
  restricted?: boolean;
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
