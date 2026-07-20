import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { BlogPageClient } from './BlogPageClient';

export const metadata = buildPageMetadata({
  // 괄호는 메타 설명 정제 과정에서 공백으로 치환되므로 description 에는 쓰지 않는다.
  title: '기술 블로그 아카이브',
  description:
    '개발자 김승찬의 기술 블로그 아카이브. 개발하면서 배우고 느낀 것들을 기록한 글 모음이며, 카테고리와 태그, 검색으로 탐색할 수 있습니다.',
  path: '/blog',
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

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/blog#collection`,
  url: `${SITE_URL}/blog`,
  name: '블로그 아카이브',
  description: '개발하면서 배우고 느낀 것들을 기록한 글 모음입니다.',
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
  about: {
    '@id': `${SITE_URL}/#person`,
  },
};

export default function BlogPage() {
  return (
    <>
      <JsonLd id="blog-page" data={blogJsonLd} />
      <BlogPageClient />
    </>
  );
}
