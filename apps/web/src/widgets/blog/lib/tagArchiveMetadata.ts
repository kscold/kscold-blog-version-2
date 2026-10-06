import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  isIndexableTag,
  SITE_URL,
} from '@/shared/lib/seo';
import { getArchivePagePath } from './archivePage';
import type { TagArchiveData } from './loadTagArchive';

export function buildTagArchiveMetadata(archive: TagArchiveData) {
  const pageSuffix = archive.page === 1 ? '' : ` · ${archive.page}페이지`;
  return buildPageMetadata({
    title: `#${archive.tag.name}${pageSuffix}`,
    description: `김승찬 블로그에서 #${archive.tag.name} 태그가 붙은 기술 글과 피드를 한곳에 모았습니다. ${archive.tag.name} 관련 기록을 최신순과 인기순으로 살펴볼 수 있습니다.`,
    path: getArchivePagePath(archive.basePath, archive.page),
    keywords: [archive.tag.name, '태그', '기술 블로그'],
    noIndex: archive.sort === 'popular' || archive.type !== 'all' || archive.feedPage > 1 || !isIndexableTag(archive.tag),
  });
}

export function buildTagArchiveJsonLd(archive: TagArchiveData) {
  const path = getArchivePagePath(archive.basePath, archive.page);
  const url = `${SITE_URL}${path}`;
  const name =
    archive.page === 1 ? `#${archive.tag.name}` : `#${archive.tag.name} · ${archive.page}페이지`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
        url,
        name,
        description: `${archive.tag.name} 태그의 블로그와 피드 모음입니다.`,
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
