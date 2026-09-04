import type { MetadataRoute } from 'next';
import type { Category, Post, Tag } from '@/shared/model/types/blog';
import type { Feed } from '@/shared/model/types/social';
import { TEAM_PROFILES } from '@/entities/profile';
import {
  SITE_URL,
  fetchAllPublicApiPages,
  fetchPublicApi,
  flattenCategories,
  isIndexableFeed,
  isIndexableTag,
  isIndexableVaultNote,
} from '@/shared/lib/seo';

const toDate = (date: Date | string | undefined): string =>
  new Date(date || Date.now()).toISOString().split('T')[0];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categoryTree, tags, feeds, vaultNoteIndex] = await Promise.all([
    fetchAllPublicApiPages<Post>('/posts'),
    fetchPublicApi<Category[]>('/categories'),
    fetchPublicApi<Tag[]>('/tags'),
    fetchAllPublicApiPages<Feed>('/feeds'),
    // 전체 그래프를 만들지 않고 검색 노출 판정에 필요한 slug 와 본문 길이만 조회한다.
    fetchPublicApi<{ slug: string; contentLength?: number }[]>('/vault/notes/sitemap-index'),
  ]);

  // 일부 데이터만 빠진 200 응답을 캐시하면 검색엔진에는 대량 URL 삭제로 보인다.
  // 재생성 오류를 그대로 올려 직전 정상 ISR 결과를 유지하고 다음 요청에서 재시도한다.
  if (
    posts === null ||
    categoryTree === null ||
    tags === null ||
    feeds === null ||
    vaultNoteIndex === null
  ) {
    throw new Error('사이트맵 데이터를 모두 불러오지 못했습니다.');
  }

  const categories = flattenCategories(categoryTree).filter(
    category => !category.restricted
  );
  // 제한 글은 상세 메타데이터가 noindex 이므로 사이트맵에서도 제외해 크롤링 신호를 일치시킨다.
  const indexablePosts = posts.filter(
    post => post.status === 'PUBLISHED' && !post.restricted
  );
  const indexableFeeds = feeds.filter(
    feed => feed.visibility === 'PUBLIC' && isIndexableFeed(feed.content)
  );
  const publicPostCountsByTagId = new Map<string, number>();
  indexablePosts.forEach(post => {
    post.tags.forEach(tag => {
      publicPostCountsByTagId.set(
        tag.id,
        (publicPostCountsByTagId.get(tag.id) || 0) + 1
      );
    });
  });
  const indexableTags = tags
    .map(tag => ({ ...tag, postCount: publicPostCountsByTagId.get(tag.id) || 0 }))
    .filter(isIndexableTag);
  // 본문 길이를 확인할 수 있고 독립 문서로 충분한 노트만 사이트맵에 싣는다.
  const vaultNotes = vaultNoteIndex.filter(
    note => !!note.slug && isIndexableVaultNote(note.contentLength)
  );

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/feed`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/product`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/vault`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/admin-night`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/admin-night/ai-agent-bloom`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guestbook`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/info`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...TEAM_PROFILES.map(team => ({
      url: `${SITE_URL}/info/${team.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...categories.map(category => ({
      url: `${SITE_URL}/blog/${category.slug}`,
      lastModified: toDate(category.updatedAt || category.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    ...indexableTags.map(tag => ({
      url: `${SITE_URL}/blog/tags/${encodeURIComponent(tag.slug)}`,
      lastModified: toDate(tag.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    })),
    ...indexablePosts.map(post => ({
      url: `${SITE_URL}/blog/${post.category.slug}/${post.slug}`,
      lastModified: toDate(post.updatedAt || post.publishedAt || post.createdAt),
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.9 : 0.8,
    })),
    ...indexableFeeds.map(feed => ({
      url: `${SITE_URL}/feed/${feed.id}`,
      lastModified: toDate(feed.updatedAt || feed.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.55,
    })),
    // 그래프 API 에는 수정일이 없어 lastModified 를 생략한다(부정확한 날짜를 넣는 것보다 낫다).
    ...vaultNotes.map(note => ({
      url: `${SITE_URL}/vault/${encodeURIComponent(note.slug)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
