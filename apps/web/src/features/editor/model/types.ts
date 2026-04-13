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
