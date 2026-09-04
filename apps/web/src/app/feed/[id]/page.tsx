import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Feed } from '@/shared/model/types/social';
import { FeedDetail } from '@/widgets/feed/detail';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  extractFirstMarkdownHeading,
  extractFirstMarkdownImage,
  fetchPublicApi,
  isIndexableFeed,
  toMetaDescription,
  toOgImage,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

async function getFeed(id: string) {
  return fetchPublicApi<Feed>(`/feeds/${id}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const feed = await getFeed(id);

  if (!feed || feed.visibility !== 'PUBLIC') {
    notFound();
  }

  const title =
    extractFirstMarkdownHeading(feed.content) ||
    feed.linkPreview?.title ||
    toMetaDescription(feed.content, `${feed.author.name}의 피드`, 58);
  const description = toMetaDescription(feed.content, '일상, 개발, 그리고 생각의 조각들');
  const image =
    feed.images[0] || extractFirstMarkdownImage(feed.content) || feed.linkPreview?.image;

  return buildPageMetadata({
    title,
    description,
    path: `/feed/${feed.id}`,
    keywords: uniqueKeywords(['피드', feed.author.name, feed.linkPreview?.siteName]),
    type: 'article',
    image,
    publishedTime: feed.createdAt,
    modifiedTime: feed.updatedAt,
    authors: [{ name: feed.author.name }],
    noIndex: !isIndexableFeed(feed.content),
  });
}

export default async function FeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feed = await getFeed(id);

  if (!feed || feed.visibility !== 'PUBLIC') {
    notFound();
  }

  const description = toMetaDescription(feed.content, '일상, 개발, 그리고 생각의 조각들');
  const headline =
    extractFirstMarkdownHeading(feed.content) || feed.linkPreview?.title || description;
  const image =
    feed.images[0] || extractFirstMarkdownImage(feed.content) || feed.linkPreview?.image;
  const canonicalPath = `/feed/${feed.id}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SocialMediaPosting',
        '@id': `${absoluteUrl(canonicalPath)}#posting`,
        url: absoluteUrl(canonicalPath),
        headline,
        datePublished: feed.createdAt,
        dateModified: feed.updatedAt,
        author: feed.author.username === 'kscold'
          ? { '@id': `${absoluteUrl('/')}#person` }
          : {
              '@type': 'Person',
              name: feed.author.name,
              url: feed.author.username
                ? absoluteUrl(`/profile/${feed.author.username}`)
                : undefined,
            },
        image: [toOgImage(image)],
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/ViewAction',
            userInteractionCount: feed.views,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: feed.commentsCount,
          },
        ],
        mainEntityOfPage: absoluteUrl(canonicalPath),
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '피드', path: '/feed' },
        { name: description, path: canonicalPath },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`feed-${feed.id}`} data={jsonLd} />
      <FeedDetail initialFeed={feed} />
    </>
  );
}

export const revalidate = 3600;
