import type { Post } from '@/shared/model/types/blog';

/** 발행된 글은 공개 주소로, 아직 공개 전인 글은 관리자 미리보기로 연다. */
export function getPostViewHref(post: Pick<Post, 'status' | 'slug' | 'category'>) {
  return post.status === 'PUBLISHED'
    ? `/blog/${post.category.slug}/${post.slug}`
    : `/admin/preview/${post.slug}`;
}
