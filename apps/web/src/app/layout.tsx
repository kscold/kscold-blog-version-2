import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Providers } from './providers/providers';
import { ClientLayout } from './providers/ClientLayout';
import { PROFILE } from '@/entities/profile';
import { BUSINESS_INFO } from '@/entities/profile';
import { ANONYMOUS_VIEWER } from '@/shared/lib/initialViewer';
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
    '김승찬 개발자',
    '김승찬 블로그',
    '김승찬의 블로그',
    '김승찬 기술블로그',
    '김승찬의 기술블로그',
    '기술 블로그',
    '기술블로그',
    '콜딩 블로그',
    '김승찬 풀스택',
    '김승찬 AI Agent 개발자',
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
    'LangGraph',
    'RAG',
    'MongoDB',
    'React',
    'Next.js',
    'TypeScript',
    'Spring Boot',
    'Java',
    'NestJS',
    'Docker',
  ],
  authors: [{ name: '김승찬', url: `${SITE_URL}/info` }],
  creator: '김승찬',
  publisher: '콜딩(Colding)',
  category: 'technology',
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
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
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      // alternateName 은 사이트를 부르는 다른 이름만 담는다. 노리는 검색어를 나열하면
      // 구글이 사이트 이름 후보 판정을 아예 포기해 오히려 손해다. name(김승찬 블로그)과 중복도 제거.
      alternateName: ['KSCOLD', '김승찬의 기술 블로그'],
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
      // 콜딩/Colding 은 사람이 아니라 사업자명이라 별도 Organization 으로 연결한다.
      alternateName: ['kscold', 'KSCOLD', 'Kim Seung Chan', 'KIM SEUNG CHAN'],
      url: `${SITE_URL}/info`,
      mainEntityOfPage: {
        '@id': `${SITE_URL}/info#profile-page`,
      },
      description:
        '김승찬(kscold)은 AI Agent 개발을 중심으로 서버·웹 애플리케이션을 만드는 풀스택 개발자입니다. ' +
        'LangGraph·RAG 기반 AI Agent와 Spring Boot·Next.js·TypeScript 기반 서비스의 설계·배포·운영을 수행하며, ' +
        '경험과 기술 기록을 김승찬 블로그 kscold.com에 공개합니다.',
      image: 'https://avatars.githubusercontent.com/u/66587554?v=4',
      jobTitle: 'AI Agent·풀스택 개발자',
      hasOccupation: {
        '@type': 'Occupation',
        name: 'AI Agent 개발자 및 풀스택 개발자',
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
        'AI Agent', 'LangGraph', 'RAG', 'Python', 'LLM',
        'MongoDB', 'Spring Boot', 'Java', 'Next.js', 'TypeScript', 'React',
        'NestJS', 'Docker', 'PostgreSQL', 'CI/CD', 'Harness Engineering', 'Claude API',
        '백엔드 개발', '프론트엔드 개발', '풀스택 개발', 'AI 에이전트',
      ],
      sameAs: [
        PROFILE.contacts.github,
        'https://www.instagram.com/ks_cold',
        'https://www.threads.net/@kscold_dev',
      ],
      worksFor: {
        '@id': `${SITE_URL}/#current-employer`,
      },
      affiliation: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#current-employer`,
      name: '씨에스리 AI기술연구소',
      employee: {
        '@id': `${SITE_URL}/#person`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: BUSINESS_INFO.companyName,
      alternateName: ['콜딩', 'Colding'],
      url: SITE_URL,
      description:
        '콜딩(Colding)은 김승찬이 운영하는 개인사업자입니다. cold와 ing의 결합이자 coding과의 언어유희를 담은 이름으로, 소프트웨어와 AI 서비스를 개발·운영합니다.',
      founder: {
        '@id': `${SITE_URL}/#person`,
      },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 min-h-screen relative selection:bg-accent-light/30 selection:text-accent-light transition-colors duration-300">
        <JsonLd id="site-graph" data={siteJsonLd} />
        <Suspense>
          <AnalyticsScripts gaId={gaId} />
        </Suspense>

        <div className="fixed inset-0 z-[-1] pointer-events-none bg-surface-50 dark:bg-surface-950 transition-colors duration-300"></div>

        <Providers>
          <ClientLayout initialViewer={ANONYMOUS_VIEWER}>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
