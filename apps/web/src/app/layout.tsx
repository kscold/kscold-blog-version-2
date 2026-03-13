import type { Metadata } from 'next';
import { Providers } from '@/app/providers/providers';
import { ClientLayout } from '@/app/providers/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '김승찬 블로그',
    template: '%s | 김승찬 블로그',
  },
  description: '배운 것을 기록하고, 기록을 연결합니다. 개발 공부와 일상을 쌓아가는 공간.',
  keywords: [
    '김승찬',
    'kscold',
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
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://kscold.com',
    title: '김승찬 블로그',
    description: '배운 것을 기록하고, 기록을 연결합니다. 개발 공부와 일상을 쌓아가는 공간.',
    siteName: '김승찬 블로그',
  },
  twitter: {
    card: 'summary_large_image',
    title: '김승찬 블로그',
    description: '배운 것을 기록하고, 기록을 연결합니다. 개발 공부와 일상을 쌓아가는 공간.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 min-h-screen relative selection:bg-accent-light/30 selection:text-accent-light transition-colors duration-300">
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-surface-50 dark:bg-surface-950 transition-colors duration-300"></div>

        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
