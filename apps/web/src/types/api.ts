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
