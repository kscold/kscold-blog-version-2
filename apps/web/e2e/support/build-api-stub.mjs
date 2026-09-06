import { createServer } from 'node:http';
import { blogArchiveCategory, getBlogArchivePage } from './blog-archive-fixtures.mjs';
import {
  emptyProfileFeedPage,
  getProfileFeedPage,
  getPublicProfileFixture,
  invalidProfileFeedPage,
  PROFILE_FEED_SLOW_DELAY_MS,
} from './profile-feed-fixtures.mjs';

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
const vaultWikiLinkNote = {
  id: 'ci-vault-note',
  title: 'CI Vault 위키링크 검증',
  slug: 'ci-vault-wikilink',
  content: '[[연결 노트|표시 이름]]과 [[없는 노트]]를 함께 확인합니다.',
  folderId: 'ci-folder',
  author: {
    id: 'ci-author',
    name: '김승찬',
  },
  outgoingLinks: [],
  tags: ['CI'],
  views: 0,
  commentsCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};
const vaultTitleIndex = [
  { name: '연결 노트', slug: 'linked-note' },
  { name: '무관한 노트', slug: 'unrelated-note' },
];
let requestCount = 0;
const requestCountsByPath = new Map();

function getResponseData(requestUrl) {
  const { pathname, searchParams } = requestUrl;
  if (pathname === '/api/health') {
    return { status: 'UP' };
  }
  if (pathname.startsWith('/api/users/profile/')) {
    return getPublicProfileFixture(pathname.slice('/api/users/profile/'.length));
  }
  if (pathname === '/api/users/kscold/feeds') {
    return getProfileFeedPage(Number(searchParams.get('page') ?? 0));
  }
  if (pathname === '/api/users/ci-feed-invalid/feeds') {
    return invalidProfileFeedPage;
  }
  if (
    pathname === '/api/tags' ||
    pathname === '/api/feeds/sitemap-index' ||
    pathname === '/api/vault/notes/sitemap-index'
  ) {
    return [];
  }
  if (pathname === '/api/categories') {
    return [blogArchiveCategory];
  }
  if (pathname === '/api/posts/featured') {
    return [featuredPost];
  }
  if (pathname === '/api/posts/slug/ci-frontend-verification') {
    return featuredPost;
  }
  if (pathname === '/api/posts') {
    return getBlogArchivePage(featuredPost, searchParams);
  }
  if (pathname === '/api/feeds') {
    return emptyPage;
  }
  if (pathname === '/api/vault/notes/slug/ci-vault-wikilink') {
    return vaultWikiLinkNote;
  }
  if (pathname === '/api/vault/notes/title-index') {
    return vaultTitleIndex;
  }
  return null;
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://127.0.0.1:${port}`);
  setCorsHeaders(request, response);
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }
  if (requestUrl.pathname === '/__request-count') {
    const pathname = requestUrl.searchParams.get('pathname');
    const count = pathname ? requestCountsByPath.get(pathname) ?? 0 : requestCount;
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(String(count));
    return;
  }
  if (requestUrl.pathname !== '/api/health') {
    requestCount += 1;
    requestCountsByPath.set(
      requestUrl.pathname,
      (requestCountsByPath.get(requestUrl.pathname) ?? 0) + 1
    );
  }

  if (requestUrl.pathname === '/api/users/ci-feed-failure/feeds') {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.writeHead(503);
    response.end(JSON.stringify({ success: false }));
    return;
  }

  if (requestUrl.pathname === '/api/users/ci-feed-slow/feeds') {
    setTimeout(() => {
      if (response.destroyed) return;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.writeHead(200);
      response.end(JSON.stringify({ success: true, data: emptyProfileFeedPage }));
    }, PROFILE_FEED_SLOW_DELAY_MS);
    return;
  }

  const data = getResponseData(requestUrl);

  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (data === null) {
    response.writeHead(404);
    response.end(JSON.stringify({ success: false }));
    return;
  }

  response.writeHead(200);
  response.end(JSON.stringify({ success: true, data }));
});

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

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
