import type { Post, PostCreateRequest, PostUpdateRequest } from '@/shared/model/types/blog';
import type { PostFormData, PostSubmission } from '../model/types';

export function createPostForm(post?: Post): PostFormData {
  return {
    title: post?.title ?? '', slug: post?.slug ?? '', content: post?.content ?? '',
    excerpt: post?.excerpt ?? '', coverImage: post?.coverImage ?? '', categoryId: post?.category.id ?? '',
    tagIds: post?.tags?.map(tag => tag.id).filter(Boolean) ?? [], status: post?.status ?? 'DRAFT',
    featured: post?.featured ?? false, publicOverride: post?.publicOverride ?? false,
    metaTitle: post?.seo?.metaTitle ?? '', metaDescription: post?.seo?.metaDescription ?? '',
    keywords: post?.seo?.keywords?.join(', ') ?? '',
  };
}

function commonFields(form: PostFormData) {
  return {
    title: form.title, content: form.content, excerpt: form.excerpt,
    coverImage: form.coverImage, categoryId: form.categoryId,
    tagIds: form.tagIds.filter(Boolean), featured: form.featured,
    publicOverride: form.publicOverride, metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    keywords: form.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
  };
}

export function toPostCreate(form: PostFormData): PostCreateRequest {
  return {
    ...commonFields(form), slug: form.slug,
    status: form.status === 'ARCHIVED' ? 'DRAFT' : form.status,
    excerpt: form.excerpt || undefined, metaTitle: form.metaTitle || undefined,
    metaDescription: form.metaDescription || undefined,
  };
}

export function toPostUpdate({ form, changeSlug }: PostSubmission): PostUpdateRequest {
  return { ...commonFields(form), status: form.status, ...(changeSlug ? { slug: form.slug } : {}) };
}
