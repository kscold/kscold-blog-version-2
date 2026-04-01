import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Tag } from '@/types/blog';
import { TagPostContainer } from '@/widgets/blog/ui/TagPostContainer';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

async function getTag(tagSlug: string) {
  const tags = await fetchPublicApi<Tag[]>('/tags');
  return tags?.find(tag => tag.slug === tagSlug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const tag = await getTag(decodedSlug);

  if (!tag) {
    return buildPageMetadata({
      title: '태그를 찾을 수 없습니다',
      description: '요청한 태그를 찾을 수 없습니다.',
      path: '/blog',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `#${tag.name}`,
    description: `${tag.name} 태그로 묶인 포스트 모음입니다.`,
    path: `/blog/tags/${encodeURIComponent(tag.slug)}`,
    keywords: [tag.name, '태그', '기술 블로그'],
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const tag = await getTag(decodedSlug);

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
      <TagPostContainer tagSlug={tag.slug} />
    </>
  );
}

export const revalidate = 3600;
