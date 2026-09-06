import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { getBlogArchivePath } from './blogArchivePage';

export function buildBlogArchiveMetadata(page: number) {
  return buildPageMetadata({
    title: page === 1 ? '기술 블로그 아카이브' : `기술 블로그 아카이브 · ${page}페이지`,
    description:
      '개발자 김승찬의 기술 블로그 아카이브. 개발하면서 배우고 느낀 것들을 기록한 글 모음이며, 카테고리와 태그, 검색으로 탐색할 수 있습니다.',
    path: getBlogArchivePath(page),
    keywords: [
      '김승찬 기술블로그',
      '김승찬의 블로그',
      '기술 블로그',
      '개발 아카이브',
      'Next.js',
      'Spring Boot',
      'TypeScript',
    ],
  });
}

export function buildBlogArchiveJsonLd(page: number) {
  const url = `${SITE_URL}${getBlogArchivePath(page)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: page === 1 ? '블로그 아카이브' : `블로그 아카이브 · ${page}페이지`,
    description: '개발하면서 배우고 느낀 것들을 기록한 글 모음입니다.',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#person` },
  };
}
