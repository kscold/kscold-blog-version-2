import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Providers } from '@/app/providers/providers';
import { ClientLayout } from '@/app/providers/ClientLayout';
import { PROFILE } from '@/entities/profile/model/profileData';
import { BUSINESS_INFO } from '@/entities/profile/model/teamData';
import { resolveInitialViewer } from '@/shared/lib/initialViewer';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, toOgImage } from '@/shared/lib/seo';
import { AnalyticsScripts } from '@/shared/ui/AnalyticsScripts';
import { JsonLd } from '@/shared/ui/JsonLd';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: [
    '김승찬',
    'kscold',
    '콜딩',
    'Colding',
    '프론트엔드',
    '백엔드',
    '개발자',
    '블로그',
    'React',
    'Next.js',
    'TypeScript',
    'Spring Boot',
  ],
  authors: [{ name: '김승찬', url: 'https://github.com/kscold' }],
  creator: '김승찬',
  publisher: '콜딩(Colding)',
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: toOgImage(),
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [toOgImage()],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'ko-KR',
      description: SITE_DESCRIPTION,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: PROFILE.name,
      alternateName: PROFILE.handle,
      url: SITE_URL,
      description: PROFILE.bio.join(' '),
      image: 'https://avatars.githubusercontent.com/u/66587554?v=4',
      jobTitle: PROFILE.title,
      sameAs: [PROFILE.contacts.github],
      worksFor: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: BUSINESS_INFO.companyName,
      url: SITE_URL,
      founder: PROFILE.name,
      email: BUSINESS_INFO.email,
      taxID: BUSINESS_INFO.registrationNumber,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '김포한강9로75번길 66, 5층 (구래동, 국제프라자)',
        addressLocality: '김포시',
        addressRegion: '경기도',
        addressCountry: 'KR',
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialViewer = resolveInitialViewer(cookieStore.get('auth-token')?.value);

  return (
    <html lang="ko" suppressHydrationWarning>
      <head />
      <body className="antialiased bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 min-h-screen relative selection:bg-accent-light/30 selection:text-accent-light transition-colors duration-300">
        <JsonLd id="site-graph" data={siteJsonLd} />
        <AnalyticsScripts gtmId={gtmId} gaId={gaId} />
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <div className="fixed inset-0 z-[-1] pointer-events-none bg-surface-50 dark:bg-surface-950 transition-colors duration-300"></div>

        <Providers>
          <ClientLayout initialViewer={initialViewer}>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
