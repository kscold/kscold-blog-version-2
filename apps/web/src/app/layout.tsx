import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { Providers } from '@/app/providers/providers';
import { ClientLayout } from '@/app/providers/ClientLayout';
import { PROFILE } from '@/entities/profile/model/profileData';
import { BUSINESS_INFO } from '@/entities/profile/model/teamData';
import { resolveInitialViewer } from '@/shared/lib/initialViewer';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, toOgImage } from '@/shared/lib/seo';
import { AnalyticsScripts } from '@/shared/ui/AnalyticsScripts';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';
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
    '김승찬 개발자',
    '김승찬 블로그',
    '김승찬 풀스택',
    '김승찬 프로덕트 엔지니어',
    '개발자 김승찬',
    'kscold',
    'kscold 블로그',
    'KSCOLD',
    '콜딩',
    'Colding',
    '개발자',
    '블로그',
    '프론트엔드',
    '백엔드',
    '풀스택 개발자',
    'AI 에이전트',
    'React',
    'Next.js',
    'TypeScript',
    'Spring Boot',
    'Java',
    'NestJS',
    'Docker',
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
  verification: {
    google: 'OtRvH0_mDDoENAgaBUzfI96n8MGbikoMboY3Mj1GZr8',
    other: {
      'naver-site-verification': ['1dac7b194ac38f7dea77dcad259828346ccc564f'],
    },
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ['김승찬', '김승찬 블로그', 'kscold', 'KSCOLD', 'kscold.com'],
      inLanguage: 'ko-KR',
      description: SITE_DESCRIPTION,
      about: { '@id': `${SITE_URL}/#person` },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: PROFILE.name,
      alternateName: ['김승찬', 'kscold', 'KSCOLD', '콜딩', 'Colding', 'Kim Seung Chan'],
      url: SITE_URL,
      mainEntityOfPage: SITE_URL,
      description:
        '김승찬(kscold)은 백엔드·프론트엔드를 아우르는 풀스택 프로덕트 엔지니어입니다. ' +
        'Spring Boot·Next.js·TypeScript 기반 서비스 개발과 AI 에이전트(LangGraph·RAG·하네스 엔지니어링)를 다루며, ' +
        '배운 것을 블로그(kscold.com)에 기록합니다.',
      image: 'https://avatars.githubusercontent.com/u/66587554?v=4',
      jobTitle: '풀스택 프로덕트 엔지니어',
      hasOccupation: {
        '@type': 'Occupation',
        name: '소프트웨어 개발자',
        occupationLocation: { '@type': 'Country', name: '대한민국' },
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressRegion: '경기도',
      },
      nationality: 'Korean',
      email: PROFILE.contacts.email,
      knowsAbout: [
        'Spring Boot', 'Next.js', 'TypeScript', 'React', 'Java',
        'NestJS', 'Docker', 'MongoDB', 'PostgreSQL', 'CI/CD',
        'AI Agent', 'LangGraph', 'RAG', 'Harness Engineering', 'Claude API',
        '백엔드 개발', '프론트엔드 개발', '풀스택 개발', 'AI 에이전트',
      ],
      sameAs: [
        PROFILE.contacts.github,
        'https://www.instagram.com/ks_cold',
        'https://www.threads.net/@kscold_dev',
      ],
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
      <body className="antialiased bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 min-h-screen relative selection:bg-accent-light/30 selection:text-accent-light transition-colors duration-300">
        <JsonLd id="site-graph" data={siteJsonLd} />
        <Suspense>
          <AnalyticsScripts gaId={gaId} />
          {/* 콘텐츠 페이지에서만 광고 로드 (애드센스 정책 준수) */}
          {adsenseId && <AdSenseScript clientId={adsenseId} />}
        </Suspense>

        <div className="fixed inset-0 z-[-1] pointer-events-none bg-surface-50 dark:bg-surface-950 transition-colors duration-300"></div>

        <Providers>
          <ClientLayout initialViewer={initialViewer}>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
