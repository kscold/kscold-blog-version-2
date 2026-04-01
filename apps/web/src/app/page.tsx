import type { Metadata } from 'next';
import { HeroSection } from '@/widgets/home/ui/HeroSection';
import { FeaturedPostsSection } from '@/widgets/home/ui/FeaturedPostsSection';
import { StatsSection } from '@/widgets/home/ui/StatsSection';
import { PROFILE } from '@/entities/profile/model/profileData';
import { SITE_NAME, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
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
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#profile`,
      url: SITE_URL,
      name: `${PROFILE.name} 프로필`,
      mainEntity: {
        '@id': `${SITE_URL}/#person`,
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd id="home-page" data={homeJsonLd} />
      <main className="min-h-screen text-surface-900">
        <HeroSection />

        <FeaturedPostsSection />

        <StatsSection />
      </main>
    </>
  );
}
