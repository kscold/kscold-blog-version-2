import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/lib/seo';

export default function robots(): MetadataRoute.Robots {
  // robots.txt 의 Disallow 는 접두어 매칭이라 '/admin' 하나로 '/admin-night' 까지 함께 막힌다.
  // '/admin-night'(프로그램 소개·상품 상세)는 공개 페이지이므로, 더 긴 일치 규칙이 우선한다는 점을 이용해 명시적으로 허용한다.
  // '/vault' 는 공개 노트라 크롤링을 허용한다(색인 대상).
  const allow = ['/', '/admin-night'];
  const disallow = ['/admin', '/admin/', '/api/', '/login'];
  const majorBots = [
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-Video',
    'Google-Extended',
    'AdsBot-Google',
    'Mediapartners-Google',
    'Bingbot',
    'DuckDuckBot',
    'Slurp',
    'Yeti',
    'NaverBot',
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot',
    'Applebot',
    'GPTBot',
    'ChatGPT-User',
    'CCBot',
    'ClaudeBot',
    'PerplexityBot',
    'Bytespider',
  ];

  return {
    rules: [
      ...majorBots.map(userAgent => ({
        userAgent,
        allow,
        disallow,
      })),
      {
        userAgent: '*',
        allow,
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
