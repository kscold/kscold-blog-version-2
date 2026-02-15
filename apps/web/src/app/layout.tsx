import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { ClientLayout } from '@/components/layout/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '김승찬 블로그',
    template: '%s | 김승찬 블로그',
  },
  description: '도도하고 미술관 같은 개발 블로그',
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
    url: 'https://blog.kscold.com',
    title: '김승찬 블로그',
    description: '도도하고 미술관 같은 개발 블로그',
    siteName: '김승찬 블로그',
  },
  twitter: {
    card: 'summary_large_image',
    title: '김승찬 블로그',
    description: '도도하고 미술관 같은 개발 블로그',
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
      <body className="antialiased bg-background-dark text-white min-h-screen relative selection:bg-accent-light/30 selection:text-accent-light">
        {/* Global Background & Grid */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-background-dark" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-dark/15 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4 animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-blue/15 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 animate-pulse-slow animation-delay-400" />

          {/* Grid with Vignette Mask */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08] mask-gradient-radial" />

          {/* Noise Texture */}
          <div className="bg-noise" />
        </div>

        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
