import type { MetadataRoute } from 'next';
import type { PageResponse } from '@/types/api';
import type { Category, Post, Tag } from '@/types/blog';
import type { Feed } from '@/types/social';
import type { GraphData } from '@/types/vault';
import { SITE_URL, fetchPublicApi, flattenCategories } from '@/shared/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [postsPage, categoryTree, tags, feedsPage, vaultGraph] = await Promise.all([
    fetchPublicApi<PageResponse<Post>>('/posts?size=1000'),
    fetchPublicApi<Category[]>('/categories'),
    fetchPublicApi<Tag[]>('/tags'),
    fetchPublicApi<PageResponse<Feed>>('/feeds?page=0&size=2000'),
    fetchPublicApi<GraphData>('/vault/notes/graph'),
  ]);

  const categories = flattenCategories(categoryTree || []);
  const posts = (postsPage?.content || []).filter(post => post.status === 'PUBLISHED');
  const feeds = (feedsPage?.content || []).filter(feed => feed.visibility === 'PUBLIC');
  const vaultNodes = (vaultGraph?.nodes || []).filter(node => !node.isFolder && node.slug);

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/feed`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/vault`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/guestbook`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/info`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/info/pawpong`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...categories.map(category => ({
      url: `${SITE_URL}/blog/${category.slug}`,
      lastModified: category.updatedAt || category.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    ...(tags || []).map(tag => ({
      url: `${SITE_URL}/blog/tags/${encodeURIComponent(tag.slug)}`,
      lastModified: tag.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    })),
    ...posts.map(post => ({
      url: `${SITE_URL}/blog/${post.category.slug}/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || post.createdAt,
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.9 : 0.8,
    })),
    ...feeds.map(feed => ({
      url: `${SITE_URL}/feed/${feed.id}`,
      lastModified: feed.updatedAt || feed.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.55,
    })),
    ...vaultNodes.map(node => ({
      url: `${SITE_URL}/vault/${node.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
