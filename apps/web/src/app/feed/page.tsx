import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { FeedPageClient } from './FeedPageClient';

export const metadata = buildPageMetadata({
  title: '피드',
  description: '일상, 개발, 그리고 생각의 조각들을 짧은 글과 링크로 남기는 피드입니다.',
  path: '/feed',
  keywords: ['개발 피드', '일상 메모', '링크 로그', '김승찬'],
});

const feedJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/feed#collection`,
  url: `${SITE_URL}/feed`,
  name: '피드',
  description: '일상, 개발, 그리고 생각의 조각들을 짧은 글과 링크로 남기는 피드입니다.',
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
};

export default function FeedPage() {
  return (
    <>
      <JsonLd id="feed-page" data={feedJsonLd} />
      <FeedPageClient />
    </>
  );
}
