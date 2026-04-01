import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/lib/seo';

export default function robots(): MetadataRoute.Robots {
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
        allow: '/',
        disallow,
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
