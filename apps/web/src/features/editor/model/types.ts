import type { Post } from '@/shared/model/types/blog';

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categoryId: string;
  tagIds: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  publicOverride: boolean;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface PostSubmission {
  form: PostFormData;
  changeSlug: boolean;
}

export interface PostSaveResult {
  post: Post;
  cacheRefreshed: boolean;
}
