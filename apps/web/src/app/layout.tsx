import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '김승찬 블로그',
    template: '%s | 김승찬 블로그',
  },
  description: '프론트엔드 개발자 김승찬의 기술 블로그입니다.',
  keywords: [
    '김승찬',
    'kscold',
    '프론트엔드',
    '개발자',
    '블로그',
    'React',
    'Next.js',
    'TypeScript',
  ],
  authors: [{ name: '김승찬', url: 'https://github.com/kscold' }],
  creator: '김승찬',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://blog.kscold.com',
    title: '김승찬 블로그',
    description: '프론트엔드 개발자 김승찬의 기술 블로그입니다.',
    siteName: '김승찬 블로그',
  },
  twitter: {
    card: 'summary_large_image',
    title: '김승찬 블로그',
    description: '프론트엔드 개발자 김승찬의 기술 블로그입니다.',
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
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
