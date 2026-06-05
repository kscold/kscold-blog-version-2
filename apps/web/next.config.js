/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],

  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 실험적 기능
  experimental: {
    optimizePackageImports: ['framer-motion', '@tanstack/react-query'],
  },

  // 환경 변수
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws/chat',
  },

  // 깨진 hex slug → 정상 영문 slug 301 리다이렉트 (기존 색인·외부 링크 보존)
  async redirects() {
    return [
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
