import type { Metadata } from 'next';
import { HeroSection } from '@/widgets/home';
import { FeaturedPostsSection } from '@/widgets/home';
import { AdminNightPromoSection } from '@/widgets/home';
import { StatsSection } from '@/widgets/home';
import { PROFILE } from '@/entities/profile';
import { SITE_NAME, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

export const metadata: Metadata = {
  // 사이트 이름(김승찬 블로그)은 검색 결과 위쪽에 따로 붙는다. 제목에는 블로그 이름과 하는 일을 함께 담는다.
  title: { absolute: `김승찬의 기술 블로그 - ${PROFILE.role}` },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: SITE_NAME,
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
  about: {
    '@id': `${SITE_URL}/#person`,
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd id="home-page" data={homeJsonLd} />
      <AdSenseScript />
      <main className="min-h-screen text-surface-900">
        <HeroSection />
        <div id="home-content" className="scroll-mt-20">
          <FeaturedPostsSection />
          <AdminNightPromoSection />
          <StatsSection />
        </div>
      </main>
    </>
  );
}
