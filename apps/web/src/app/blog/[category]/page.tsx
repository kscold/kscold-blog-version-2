import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import type { Category } from '@/shared/model/types/blog';
import { CategoryArchive } from '@/widgets/blog/category';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { ArchivePageSkeleton } from '@/shared/ui/RouteSkeletons';

const getCategory = cache((categorySlug: string) =>
  fetchPublicApi<Category>(`/categories/slug/${categorySlug}`)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategory(category);

  if (!categoryData) {
    notFound();
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
      <Suspense fallback={<ArchivePageSkeleton />}>
        <CategoryArchive category={categoryData} />
      </Suspense>
    </>
  );
}

export const revalidate = 3600;
