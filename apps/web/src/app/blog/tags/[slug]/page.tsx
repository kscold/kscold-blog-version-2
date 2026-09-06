import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import type { TagUsage } from '@/shared/model/types/blog';
import { TagArchive } from '@/widgets/blog/tag';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  isIndexableTag,
} from '@/shared/lib/seo';
import { safeDecodeURIComponent } from '@/shared/lib/safeDecodeURIComponent';
import { JsonLd } from '@/shared/ui/JsonLd';
import { ArchivePageSkeleton } from '@/shared/ui/RouteSkeletons';

type RegisteredTagUsage = TagUsage & { id: string; slug: string };

const getTagUsage = cache(async (tagSlug: string) => {
  const tags = await fetchPublicApi<TagUsage[]>('/tags/index');
  return (
    tags?.find(
      (item): item is RegisteredTagUsage =>
        item.slug === tagSlug && typeof item.id === 'string' && item.id.length > 0
    ) ?? null
  );
});

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagUsage(safeDecodeURIComponent(slug));

  if (!tag) {
    notFound();
  }

  return buildPageMetadata({
    title: `#${tag.name}`,
    description: `${tag.name} 태그로 묶인 포스트 모음입니다.`,
    path: `/blog/tags/${encodeURIComponent(tag.slug)}`,
    keywords: [tag.name, '태그', '기술 블로그'],
    noIndex: !isIndexableTag(tag),
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTagUsage(safeDecodeURIComponent(slug));

  if (!tag) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/blog/tags/${encodeURIComponent(tag.slug)}#collection`,
        url: `${SITE_URL}/blog/tags/${encodeURIComponent(tag.slug)}`,
        name: `#${tag.name}`,
        description: `${tag.name} 태그로 묶인 포스트 모음입니다.`,
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '블로그', path: '/blog' },
        { name: `#${tag.name}`, path: `/blog/tags/${encodeURIComponent(tag.slug)}` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`tag-${tag.id}`} data={jsonLd} />
      <Suspense fallback={<ArchivePageSkeleton />}>
        <TagArchive tag={tag} />
      </Suspense>
    </>
  );
}

export const revalidate = 3600;
