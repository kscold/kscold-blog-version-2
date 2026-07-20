import type { MetadataRoute } from 'next';
import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post, Tag } from '@/shared/model/types/blog';
import type { Feed } from '@/shared/model/types/social';
import { SITE_URL, fetchPublicApi, flattenCategories } from '@/shared/lib/seo';

const toDate = (date: Date | string | undefined): string =>
  new Date(date || Date.now()).toISOString().split('T')[0];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [postsPage, categoryTree, tags, feedsPage, vaultNoteGraph] = await Promise.all([
    fetchPublicApi<PageResponse<Post>>('/posts?size=1000'),
    fetchPublicApi<Category[]>('/categories'),
    fetchPublicApi<Tag[]>('/tags'),
    fetchPublicApi<PageResponse<Feed>>('/feeds?page=0&size=2000'),
    // 목록 API 는 노트 본문까지 실려 3.8MB 라 캐시 한도를 넘고 일부만 조회된다.
    // 그래프 API 는 slug 만 담아 675KB 로 전체 노트를 한 번에 가져올 수 있어 사이트맵에 적합하다.
    fetchPublicApi<{ nodes: { slug: string }[] }>('/vault/notes/graph'),
  ]);

  const categories = flattenCategories(categoryTree || []);
  const posts = (postsPage?.content || []).filter(post => post.status === 'PUBLISHED');
  const feeds = (feedsPage?.content || []).filter(feed => feed.visibility === 'PUBLIC');
  const vaultNotes = (vaultNoteGraph?.nodes || []).filter(note => !!note.slug);

  return [
    {
      url: SITE_URL,
      lastModified: toDate(now),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: toDate(now),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/feed`,
      lastModified: toDate(now),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/product`,
      lastModified: toDate(now),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/vault`,
      lastModified: toDate(now),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/admin-night`,
      lastModified: toDate(now),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/admin-night/ai-agent-bloom`,
      lastModified: toDate(now),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guestbook`,
      lastModified: toDate(now),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/info`,
      lastModified: toDate(now),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/info/pawpong`,
      lastModified: toDate(now),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...categories.map(category => ({
      url: `${SITE_URL}/blog/${category.slug}`,
      lastModified: toDate(category.updatedAt || category.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    ...(tags || []).map(tag => ({
      url: `${SITE_URL}/blog/tags/${encodeURIComponent(tag.slug)}`,
      lastModified: toDate(tag.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    })),
    ...posts.map(post => ({
      url: `${SITE_URL}/blog/${post.category.slug}/${post.slug}`,
      lastModified: toDate(post.updatedAt || post.publishedAt || post.createdAt),
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.9 : 0.8,
    })),
    ...feeds.map(feed => ({
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
      lastModified: toDate(now),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
