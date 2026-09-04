import type { Post } from '@/shared/model/types/blog';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './constants';
import { absoluteUrl } from './metadata';
import { toPreviewText } from './text';

const RSS_URL = `${SITE_URL}/rss.xml`;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function toTimestamp(value?: string): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toRfc822(value?: string): string | null {
  const timestamp = toTimestamp(value);
  return timestamp > 0 ? new Date(timestamp).toUTCString() : null;
}

export function buildRssDocument(posts: Post[]): string {
  const publicPosts = posts
    .filter(post => post.status === 'PUBLISHED' && !post.restricted)
    .sort(
      (left, right) =>
        toTimestamp(right.publishedAt || right.createdAt) -
        toTimestamp(left.publishedAt || left.createdAt)
    )
    .slice(0, 50);
  const lastBuildDate = toRfc822(publicPosts[0]?.publishedAt || publicPosts[0]?.createdAt);
  const items = publicPosts
    .map(post => {
      const link = absoluteUrl(`/blog/${post.category.slug}/${post.slug}`);
      const title = post.seo?.metaTitle?.trim() || post.title;
      const description = toPreviewText(post.excerpt || post.content, post.title, 280);
      const publishedAt = toRfc822(post.publishedAt || post.createdAt);

      return [
        '    <item>',
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <description>${escapeXml(description)}</description>`,
        ...(publishedAt ? [`      <pubDate>${publishedAt}</pubDate>`] : []),
        ...(post.category?.name
          ? [`      <category>${escapeXml(post.category.name)}</category>`]
          : []),
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${escapeXml(SITE_URL)}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    '    <language>ko-KR</language>',
    `    <atom:link href="${escapeXml(RSS_URL)}" rel="self" type="application/rss+xml" />`,
    ...(lastBuildDate ? [`    <lastBuildDate>${lastBuildDate}</lastBuildDate>`] : []),
    '    <ttl>60</ttl>',
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
