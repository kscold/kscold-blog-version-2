import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { BlogPageClient } from './BlogPageClient';

export const metadata = buildPageMetadata({
  title: '블로그 아카이브',
  description: '개발하면서 배우고 느낀 것들을 기록한 글 모음입니다. 카테고리와 태그, 검색으로 글을 탐색할 수 있습니다.',
  path: '/blog',
  keywords: ['기술 블로그', '개발 아카이브', 'Next.js', 'Spring Boot', 'TypeScript'],
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
