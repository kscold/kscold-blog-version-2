const linkPreviewImagePolicy = require('./src/shared/config/link-preview-images.json');

const SITEMAP_CACHE_CONTROL =
  'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';
const ROBOTS_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // canonical·description이 본문 뒤로 스트리밍되면 일부 크롤러와 SEO 감사 도구가 놓친다.
  // 동적 페이지도 메타데이터를 완성한 뒤 최초 head에 포함해 모든 UA에 같은 문서 계약을 제공한다.
  htmlLimitedBots: /.*/,

  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    // UUID 업로드와 허용된 외부 이미지를 반복 변환하지 않되 프로필 변경은 한 시간 안에 반영한다.
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bucket.kscold.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      ...linkPreviewImagePolicy.optimizedPatterns.map(pattern => ({
        ...pattern,
        port: '',
      })),
    ],
  },

  // 실험적 기능
  experimental: {
    optimizePackageImports: ['framer-motion', '@tanstack/react-query'],
  },

  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: SITEMAP_CACHE_CONTROL }],
      },
      {
        source: '/robots.txt',
        headers: [{ key: 'Cache-Control', value: ROBOTS_CACHE_CONTROL }],
      },
    ];
  },

  // 깨진 hex slug → 정상 영문 slug 301 리다이렉트 (기존 색인·외부 링크 보존)
  async redirects() {
    return [
      { source: '/inicis/payment-path', destination: '/kakaopay/payment-path', permanent: true },
      { source: '/blog/conference/aws-summit-seoul-2026-ai-agent-고도화-방향', destination: '/blog/conference/aws-summit-seoul-2026-ai-agent-key-principles', permanent: true },
      { source: '/blog/dev-story/이상1', destination: '/blog/dev-story/reflection-1', permanent: true },
      { source: '/blog/conference/EBAABDEAB3A0-db-ECBBA8ED8DBCEB9FB0EC8AA4', destination: '/blog/conference/mongodb-conference', permanent: true },
      { source: '/blog/dev-story/EC82ACEB9190EC9AA9EBAFB8', destination: '/blog/dev-story/sadu-yongmi', permanent: true },
      { source: '/blog/dev-story/EAB5BFEAB5BFEBB094EC9DB4', destination: '/blog/dev-story/good-goodbye', permanent: true },
      { source: '/blog/dev-story/ED8B80', destination: '/blog/dev-story/frame', permanent: true },
      { source: '/blog/dev-story/EC889CED9A8C', destination: '/blog/dev-story/rounds', permanent: true },
      { source: '/blog/dev-story/EAB3B5EBB0A9', destination: '/blog/dev-story/workshop', permanent: true },
      { source: '/blog/dev-story/EB8BA8EB8BA8ED95B4ECA780EAB8B0', destination: '/blog/dev-story/getting-stronger', permanent: true },
      { source: '/blog/dev-story/EB8298EC82AC-ECA1B0EC9DB4EAB8B0', destination: '/blog/dev-story/tightening-screws', permanent: true },
      { source: '/blog/dev-story/EAB8B0EBA684ECB9A0', destination: '/blog/dev-story/oiling', permanent: true },
      { source: '/blog/dev-story/EC9AA9EB9190EC9AA9EBAFB8', destination: '/blog/dev-story/yongdu-yongmi', permanent: true },
      { source: '/blog/dev-story/EB8DB0EBB88CEC98B5EC8AA4-EBA79BEBB3B4EAB8B0-EC97ACECA095EAB8B0', destination: '/blog/dev-story/devops-getting-started', permanent: true },
      { source: '/blog/dev-story/EBB091EBB9A0ECA784-strapi-ED858CEC9DB4EBB894EC9790-nestjstypeorm-EABBB4EBA789EAB8B0', destination: '/blog/dev-story/strapi-nestjs-typeorm-migration', permanent: true },
      { source: '/blog/dev-story/nestjs-EC849CEBB284-EAB09CEBB09CEC9D98-EC849CEBA789-ED959C-EB8BACEC9D98-EC97ACECA095', destination: '/blog/dev-story/nestjs-server-development-journey', permanent: true },
      { source: '/blog/dev-story/EB8298EC9D98-ECB2AB-nestjs-dx', destination: '/blog/dev-story/my-first-nestjs-dx', permanent: true },
      { source: '/blog/dev-story/nestjsEC9D98-EC84B8EAB384EBA19C-EB93A4EC96B4EAB080EB8BA4', destination: '/blog/dev-story/entering-the-nestjs-world', permanent: true },
    ];
  },
};

module.exports = nextConfig;
