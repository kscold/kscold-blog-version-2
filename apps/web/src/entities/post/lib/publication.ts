import type { Post, PostSummary } from '@/shared/model/types/blog';

export type PublicationState = 'draft' | 'public' | 'restricted' | 'archived' | 'unknown';
export type PublicationChoice = Exclude<PublicationState, 'unknown'>;

export const PUBLICATION = {
  draft: { label: '초안', description: '관리자만 볼 수 있습니다. 일반 목록에는 나오지 않습니다.', color: 'bg-amber-50 text-amber-800' },
  public: { label: '발행 · 누구나', description: '로그인 없이 본문을 읽을 수 있습니다.', color: 'bg-emerald-50 text-emerald-800' },
  restricted: { label: '발행 · 승인 필요', description: '제목·요약은 공개됩니다. 본문은 로그인 후 해당 글 또는 카테고리의 열람 승인이 필요합니다.', color: 'bg-sky-50 text-sky-800' },
  archived: { label: '보관', description: '발행을 중단하고 관리자에게만 보관합니다.', color: 'bg-surface-100 text-surface-600' },
  unknown: { label: '상태 확인 필요', description: '공개 범위를 확인한 뒤 저장해 주세요.', color: 'bg-amber-50 text-amber-800' },
} as const;

export function getPostPublication(post: Pick<PostSummary, 'status' | 'restricted'>): PublicationState {
  if (post.status === 'DRAFT') return 'draft';
  if (post.status === 'ARCHIVED') return 'archived';
  if (post.status === 'PUBLISHED') return post.restricted ? 'restricted' : 'public';
  return 'unknown';
}

export function getPostPath(post: { slug: string; category: { slug: string } }): string {
  return `/blog/${encodeURIComponent(post.category.slug)}/${encodeURIComponent(post.slug)}`;
}

export function getPostViewPath(post: Pick<Post, 'status' | 'slug' | 'category'>): string {
  return post.status === 'PUBLISHED' ? getPostPath(post) : `/admin/preview/${encodeURIComponent(post.slug)}`;
}
