import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { FeedPageView } from './FeedPageView';

const FEED_DESCRIPTION =
  '개발자 김승찬이 AI Agent·서버·웹을 만들며 얻은 생각과 링크, 짧은 작업 기록을 남기는 피드입니다. 새 모델과 도구 소식, 일하면서 배운 점을 가볍게 공유합니다.';

export const metadata = buildPageMetadata({
  title: '피드',
  description: FEED_DESCRIPTION,
  path: '/feed',
  keywords: ['개발 피드', '일상 메모', '링크 로그', '김승찬'],
});

const feedJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/feed#collection`,
  url: `${SITE_URL}/feed`,
  name: '피드',
  description: FEED_DESCRIPTION,
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
};

// 게시 직후 검색봇과 새 방문자에게도 최신 목록을 제공한다.
export const dynamic = 'force-dynamic';

export default function FeedPage() {
  return (
    <>
      <JsonLd id="feed-page" data={feedJsonLd} />
      <FeedPageView />
    </>
  );
}
