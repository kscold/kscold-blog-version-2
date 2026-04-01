import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Category } from '@/types/blog';
import { CategoryPostContainer } from '@/widgets/blog/ui/CategoryPostContainer';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

async function getCategory(categorySlug: string) {
  return fetchPublicApi<Category>(`/categories/slug/${categorySlug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategory(category);

  if (!categoryData) {
    return buildPageMetadata({
      title: '카테고리를 찾을 수 없습니다',
      description: '요청한 카테고리를 찾을 수 없습니다.',
      path: '/blog',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${categoryData.name} 카테고리`,
    description: categoryData.description || `${categoryData.name} 카테고리에 속한 포스트 모음입니다.`,
    path: `/blog/${categoryData.slug}`,
    keywords: [categoryData.name, '카테고리', '기술 블로그'],
    noIndex: Boolean(categoryData.restricted),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryData = await getCategory(category);

  if (!categoryData) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/blog/${categoryData.slug}#collection`,
        url: `${SITE_URL}/blog/${categoryData.slug}`,
        name: `${categoryData.name} 카테고리`,
        description: categoryData.description || `${categoryData.name} 카테고리에 속한 포스트 모음입니다.`,
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '블로그', path: '/blog' },
        { name: categoryData.name, path: `/blog/${categoryData.slug}` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`category-${categoryData.id}`} data={jsonLd} />
      <CategoryPostContainer categorySlug={categoryData.slug} />
    </>
  );
}

export const revalidate = 3600;
