import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import type { CategoryArchiveData } from './loadCategoryArchive';
import { getArchivePagePath } from './archivePage';

/** 카테고리에 따로 적어둔 소개가 없을 때도 검색 결과에 무슨 글이 모여 있는지 드러나게 한다. */
function describeCategory(category: { name: string; description?: string | null }) {
  return (
    category.description ||
    `김승찬 블로그의 ${category.name} 카테고리 글 모음입니다. ${category.name} 주제로 정리한 기술 글을 한곳에서 살펴볼 수 있습니다.`
  );
}

export function buildCategoryArchiveMetadata(archive: CategoryArchiveData) {
  const { category, page } = archive;
  const pageSuffix = page === 1 ? '' : ` · ${page}페이지`;
  return buildPageMetadata({
    title: `${category.name} 카테고리${pageSuffix}`,
    description: describeCategory(category),
    path: getArchivePagePath(archive.basePath, page),
    keywords: [category.name, '카테고리', '기술 블로그'],
    noIndex: Boolean(category.restricted),
  });
}

export function buildCategoryArchiveJsonLd(archive: CategoryArchiveData) {
  const path = getArchivePagePath(archive.basePath, archive.page);
  const url = `${SITE_URL}${path}`;
  const name =
    archive.page === 1
      ? `${archive.category.name} 카테고리`
      : `${archive.category.name} 카테고리 · ${archive.page}페이지`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
        url,
        name,
        description: describeCategory(archive.category),
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '블로그', path: '/blog' },
        { name, path },
      ]),
    ],
  };
}
