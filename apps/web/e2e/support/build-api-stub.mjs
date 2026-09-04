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
    pathname === '/api/vault/notes/sitemap-index' ||
    pathname === '/api/posts/featured'
  ) {
    return [];
  }
  if (pathname === '/api/posts' || pathname === '/api/feeds') {
    return emptyPage;
  }
  return null;
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://127.0.0.1:${port}`);
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
