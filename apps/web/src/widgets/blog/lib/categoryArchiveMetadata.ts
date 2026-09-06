import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import type { CategoryArchiveData } from './loadCategoryArchive';
import { getArchivePagePath } from './archivePage';

export function buildCategoryArchiveMetadata(archive: CategoryArchiveData) {
  const { category, page } = archive;
  const pageSuffix = page === 1 ? '' : ` · ${page}페이지`;
  return buildPageMetadata({
    title: `${category.name} 카테고리${pageSuffix}`,
    description: category.description || `${category.name} 카테고리에 속한 포스트 모음입니다.`,
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
        description:
          archive.category.description ||
          `${archive.category.name} 카테고리에 속한 포스트 모음입니다.`,
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
