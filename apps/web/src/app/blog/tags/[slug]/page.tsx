import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import type { Post, Tag } from '@/shared/model/types/blog';
import { TagArchive } from '@/widgets/blog/tag';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchAllPublicApiPages,
  fetchPublicApi,
  isIndexableTag,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { ArchivePageSkeleton } from '@/shared/ui/RouteSkeletons';

const getTagSeoData = cache(async (tagSlug: string) => {
  const tags = await fetchPublicApi<Tag[]>('/tags');
  const tag = tags?.find(item => item.slug === tagSlug) || null;
  if (!tag) {
    return null;
  }

  const posts = await fetchAllPublicApiPages<Post>(`/posts/tag/${tag.id}`);
  const publicPostCount = (posts || []).filter(post => !post.restricted).length;
  return { tag, publicPostCount };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const seoData = await getTagSeoData(decodedSlug);

  if (!seoData) {
    notFound();
  }
  const { tag, publicPostCount } = seoData;

  return buildPageMetadata({
    title: `#${tag.name}`,
    description: `${tag.name} 태그로 묶인 포스트 모음입니다.`,
    path: `/blog/tags/${encodeURIComponent(tag.slug)}`,
    keywords: [tag.name, '태그', '기술 블로그'],
    noIndex: !isIndexableTag({ ...tag, postCount: publicPostCount }),
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const seoData = await getTagSeoData(decodedSlug);

  if (!seoData) {
    notFound();
  }
  const { tag } = seoData;

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
