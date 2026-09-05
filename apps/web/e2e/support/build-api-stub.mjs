import { createServer } from 'node:http';

const port = Number(process.env.BUILD_API_PORT || 4100);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('BUILD_API_PORT는 유효한 포트 번호여야 합니다.');
}

const emptyPage = {
  content: [],
  page: 0,
  size: 100,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

const publicProfile = {
  id: 'ci-profile',
  username: 'kscold',
  displayName: '김승찬',
  bio: 'CI 빌드 검증용 공개 프로필',
  socialLinks: {},
  techStack: ['Spring Boot', 'Next.js', 'Python', 'LangGraph'],
};
const featuredPost = {
  id: 'ci-post',
  title: 'CI 프런트엔드 검증 글',
  slug: 'ci-frontend-verification',
  content: '운영 API와 분리된 프런트엔드 검증용 콘텐츠입니다.',
  excerpt: '운영 API와 분리된 프런트엔드 검증용 콘텐츠입니다.',
  category: {
    id: 'ci-category',
    name: 'Engineering',
    slug: 'engineering',
  },
  tags: [
    {
      id: 'ci-tag',
      name: 'CI',
      slug: 'ci',
    },
  ],
  author: {
    id: 'ci-author',
    name: '김승찬',
  },
  status: 'PUBLISHED',
  featured: true,
  restricted: false,
  views: 1,
  likes: 0,
  publishedAt: '2026-01-01T00:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};
let requestCount = 0;

function getResponseData(pathname) {
  if (pathname === '/api/health') {
    return { status: 'UP' };
  }
  if (pathname === '/api/users/profile/kscold') {
    return publicProfile;
  }
  if (
    pathname === '/api/categories' ||
    pathname === '/api/tags' ||
    pathname === '/api/feeds/sitemap-index' ||
    pathname === '/api/vault/notes/sitemap-index'
  ) {
    return [];
  }
  if (pathname === '/api/posts/featured') {
    return [featuredPost];
  }
  if (pathname === '/api/posts') {
    return {
      ...emptyPage,
      content: [featuredPost],
      totalElements: 1,
      totalPages: 1,
      empty: false,
    };
  }
  if (pathname === '/api/feeds') {
    return emptyPage;
  }
  return null;
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://127.0.0.1:${port}`);
  if (requestUrl.pathname === '/__request-count') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(String(requestCount));
    return;
  }
  if (requestUrl.pathname !== '/api/health') {
    requestCount += 1;
  }
  const data = getResponseData(requestUrl.pathname);

  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (data === null) {
    response.writeHead(404);
    response.end(JSON.stringify({ success: false }));
    return;
  }

  response.writeHead(200);
  response.end(JSON.stringify({ success: true, data }));
});

server.listen(port, '127.0.0.1');

function closeServer() {
  server.close(error => {
    if (error) {
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
