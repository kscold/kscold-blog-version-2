import type { Metadata } from 'next';
import { HeroSection } from '@/widgets/home';
import { FeaturedPostsSection } from '@/widgets/home';
import { AdminNightPromoSection } from '@/widgets/home';
import { StatsSection } from '@/widgets/home';
import { SITE_NAME, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

export const metadata: Metadata = {
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

        <FeaturedPostsSection />

        <AdminNightPromoSection />

        <StatsSection />
      </main>
    </>
  );
}
