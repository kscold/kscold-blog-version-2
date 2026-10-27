const fs = require('fs');
const path = require('path');
const linkPreviewImagePolicy = require('./src/shared/config/link-preview-images.json');
require('./scripts/prepare-pdf-assets.cjs')();
// 개발용 HMR만 eval·웹소켓을 허용하고 운영 문서 화면은 외부 자원을 차단한다.
const IS_PDF_DEVELOPMENT = process.env.NODE_ENV === 'development';
const DOCUMENTS_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${IS_PDF_DEVELOPMENT ? " 'unsafe-eval'" : ''}`,
  "worker-src 'self' blob:",
  `connect-src 'self'${IS_PDF_DEVELOPMENT ? ' ws: wss:' : ''}`,
  "img-src 'self' data: blob:",
  "font-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const SITEMAP_CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';
const ROBOTS_CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

// 한살림 강의 자료는 주소를 직접 열거나 download 속성을 무시하는 메신저 안 브라우저에서도 한글 파일 이름으로 저장되게 한다.
// 목록은 scripts/sync-hansalim-downloads.mjs가 manifest대로 맞춘 폴더에서 빌드할 때 읽는다.
// 캐시는 공개 파일 기본값(max-age=0 + ETag)을 그대로 써서 배포 직후에도 매번 새 파일인지 확인한다.
const HANSALIM_FILES_DIR = path.join(__dirname, 'public/hansalim/files');

/** RFC 5987 방식으로 이름을 바꾼다. encodeURIComponent가 남기는 !'()*까지 바꿔 경로 패턴과 헤더에 그대로 쓴다. */
function encodeFileName(name) {
  return encodeURIComponent(name).replace(
    /[!'()*]/g,
    char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function hansalimFileHeaders() {
  if (!fs.existsSync(HANSALIM_FILES_DIR)) return [];
  return fs
    .readdirSync(HANSALIM_FILES_DIR)
    .filter(name => !name.startsWith('.'))
    .map(name => ({
      source: `/hansalim/files/${encodeFileName(name)}`,
      headers: [
        {
          key: 'Content-Disposition',
          value: `attachment; filename*=UTF-8''${encodeFileName(name)}`,
        },
      ],
    }));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  // 강사 발표 화면은 Git 밖(private/)의 대본·강사용 PDF를 실행 중에 읽는다. standalone 빌드에도 함께 넣는다.
  outputFileTracingIncludes: {
    '/hansalim/presenter': ['./private/hansalim-presenter/**'],
    '/hansalim/presenter/deck': ['./private/hansalim-presenter/**'],
    '/admin/search': ['./private/search-insights/**'],
  },
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
    optimizePackageImports: ['motion/react', '@tanstack/react-query'],
  },

  async headers() {
    return [
      {
        source: '/admin/documents/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Content-Security-Policy', value: DOCUMENTS_CSP },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: SITEMAP_CACHE_CONTROL }],
      },
      {
        source: '/robots.txt',
        headers: [{ key: 'Cache-Control', value: ROBOTS_CACHE_CONTROL }],
      },
      ...hansalimFileHeaders(),
    ];
  },

  // 깨진 hex slug → 정상 영문 slug 301 리다이렉트 (기존 색인·외부 링크 보존)
  async redirects() {
    return [
      { source: '/inicis/payment-path', destination: '/kakaopay/payment-path', permanent: true },
      // 교육 자료 주소를 잘못 친 경우(실제 접속 기록의 /hansailm 등)와 한글 주소를 자료 페이지로 보낸다.
      // Next의 주소 비교는 대소문자를 가리지 않으므로 /hansalim의 대소문자 변형은 넣지 않는다(자기 자신으로 무한 이동).
      { source: '/hansailm', destination: '/hansalim', permanent: false },
      { source: '/hanslim', destination: '/hansalim', permanent: false },
      { source: '/hansallim', destination: '/hansalim', permanent: false },
      { source: '/hansalrim', destination: '/hansalim', permanent: false },
      { source: '/hansarim', destination: '/hansalim', permanent: false },
      { source: '/hanssalim', destination: '/hansalim', permanent: false },
      { source: '/hansalm', destination: '/hansalim', permanent: false },
      { source: '/hansaim', destination: '/hansalim', permanent: false },
      { source: '/%ED%95%9C%EC%82%B4%EB%A6%BC', destination: '/hansalim', permanent: false },
      {
        source: '/blog/conference/aws-summit-seoul-2026-ai-agent-고도화-방향',
        destination: '/blog/conference/aws-summit-seoul-2026-ai-agent-key-principles',
        permanent: true,
      },
      {
        source: '/blog/dev-story/이상1',
        destination: '/blog/dev-story/reflection-1',
        permanent: true,
      },
      {
        source: '/blog/conference/EBAABDEAB3A0-db-ECBBA8ED8DBCEB9FB0EC8AA4',
        destination: '/blog/conference/mongodb-conference',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EC82ACEB9190EC9AA9EBAFB8',
        destination: '/blog/dev-story/sadu-yongmi',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EAB5BFEAB5BFEBB094EC9DB4',
        destination: '/blog/dev-story/good-goodbye',
        permanent: true,
      },
      { source: '/blog/dev-story/ED8B80', destination: '/blog/dev-story/frame', permanent: true },
      {
        source: '/blog/dev-story/EC889CED9A8C',
        destination: '/blog/dev-story/rounds',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EAB3B5EBB0A9',
        destination: '/blog/dev-story/workshop',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EB8BA8EB8BA8ED95B4ECA780EAB8B0',
        destination: '/blog/dev-story/getting-stronger',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EB8298EC82AC-ECA1B0EC9DB4EAB8B0',
        destination: '/blog/dev-story/tightening-screws',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EAB8B0EBA684ECB9A0',
        destination: '/blog/dev-story/oiling',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EC9AA9EB9190EC9AA9EBAFB8',
        destination: '/blog/dev-story/yongdu-yongmi',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EB8DB0EBB88CEC98B5EC8AA4-EBA79BEBB3B4EAB8B0-EC97ACECA095EAB8B0',
        destination: '/blog/dev-story/devops-getting-started',
        permanent: true,
      },
      {
        source:
          '/blog/dev-story/EBB091EBB9A0ECA784-strapi-ED858CEC9DB4EBB894EC9790-nestjstypeorm-EABBB4EBA789EAB8B0',
        destination: '/blog/dev-story/strapi-nestjs-typeorm-migration',
        permanent: true,
      },
      {
        source:
          '/blog/dev-story/nestjs-EC849CEBB284-EAB09CEBB09CEC9D98-EC849CEBA789-ED959C-EB8BACEC9D98-EC97ACECA095',
        destination: '/blog/dev-story/nestjs-server-development-journey',
        permanent: true,
      },
      {
        source: '/blog/dev-story/EB8298EC9D98-ECB2AB-nestjs-dx',
        destination: '/blog/dev-story/my-first-nestjs-dx',
        permanent: true,
      },
      {
        source: '/blog/dev-story/nestjsEC9D98-EC84B8EAB384EBA19C-EB93A4EC96B4EAB080EB8BA4',
        destination: '/blog/dev-story/entering-the-nestjs-world',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
