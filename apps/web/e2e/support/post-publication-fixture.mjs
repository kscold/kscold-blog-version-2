import { randomBytes } from 'node:crypto';

const category = (id, name, slug, restricted) => ({ id, name, slug, restricted, depth: 0,
  ancestors: [], order: 0, postCount: 0, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' });
export const publicationCategories = [
  category('aaaaaaaaaaaaaaaaaaaaaaaa', '공개 개발', 'ci-publication-open', false),
  category('bbbbbbbbbbbbbbbbbbbbbbbb', '제한 개발', 'ci-publication-approval', true),
];
export const publicationTags = [
  { id: 'cccccccccccccccccccccccc', name: 'Next.js', slug: 'nextjs', postCount: 1 },
  { id: 'dddddddddddddddddddddddd', name: '비공개', slug: 'private', postCount: 1 },
];
const posts = new Map();
const writes = new Map();
const isAdmin = request => /auth-token=[^;]*\.ci-verified-admin(?:;|$)/.test(request.headers.cookie ?? '');
const send = (response, status, data) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ success: status < 400, data }));
};
const read = async request => {
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 1_000_000) throw new Error('시험 데이터 크기 초과'); }
  return JSON.parse(body);
};

function makePost(input) {
  const target = publicationCategories.find(item => item.id === input.categoryId) ?? publicationCategories[0];
  const now = new Date().toISOString();
  return {
    id: input.id || randomBytes(12).toString('hex'), title: '구글에 내 글이 여덟 개뿐이었다',
    slug: 'ci-publish-' + randomBytes(6).toString('hex'), content: '임시 보관과 발행을 검증하는 본문입니다.',
    excerpt: '공개 요약', tags: [publicationTags[1]],
    author: { id: 'admin-1', name: '검증 작성자' }, status: 'DRAFT', publicOverride: false,
    featured: false, views: 0, likes: 0, createdAt: now, updatedAt: now, publishedAt: null,
    ...input, category: target,
    restricted: Boolean(target.restricted && !input.publicOverride),
  };
}

function publicPost(post, request) {
  if (post.status !== 'PUBLISHED' && !isAdmin(request)) return null;
  return post.restricted && !isAdmin(request) ? { ...post, content: null } : post;
}

async function save(request, response, previous) {
  if (!isAdmin(request)) { send(response, 403, null); return; }
  const data = await read(request);
  if (data.title?.includes('[저장 실패]')) { send(response, 503, null); return; }
  const slug = data.slug ?? previous?.slug;
  if ([...posts.values()].some(post => post.slug === slug && post.id !== previous?.id)) { send(response, 409, null); return; }
  const tags = data.tagIds === undefined ? previous?.tags : publicationTags.filter(tag => data.tagIds.includes(tag.id));
  const post = makePost({ ...previous, ...data, tags: tags ?? [],
    updatedAt: new Date(Date.now() + 1000).toISOString(),
    publishedAt: data.status === 'PUBLISHED' && previous?.status !== 'PUBLISHED' ? new Date().toISOString() : previous?.publishedAt,
  });
  posts.set(post.id, post);
  writes.set(post.id, [...(writes.get(post.id) ?? []), data]);
  send(response, previous ? 200 : 201, post);
}

/** 로컬 스텁에서만 작동하는 상태 저장형 글 발행 시험 API다. */
export async function handlePublicationRequest(request, response, url) {
  const path = url.pathname;
  const admin = isAdmin(request);
  if (path === '/__publication' && request.method === 'POST') {
    const post = makePost(await read(request));
    posts.set(post.id, post); writes.set(post.id, []); send(response, 200, post); return true;
  }
  if (path === '/__publication' && request.method === 'GET') {
    const id = url.searchParams.get('id');
    send(response, 200, { post: posts.get(id), writes: writes.get(id) ?? [],
      created: [...posts.values()].filter(post => post.slug === url.searchParams.get('slug')) }); return true;
  }
  if (path === '/api/categories' && admin) { send(response, 200, publicationCategories); return true; }
  if (path === '/api/tags' && admin) { send(response, 200, publicationTags); return true; }
  if (path.startsWith('/api/posts/exists/slug/')) {
    const slug = decodeURIComponent(path.slice('/api/posts/exists/slug/'.length));
    send(response, admin ? 200 : 403, [...posts.values()].some(post => post.slug === slug)); return true;
  }
  if (path === '/api/posts/admin' && admin) {
    const all = [...posts.values()].reverse();
    send(response, 200, { content: all, number: 0, size: Math.max(20, all.length), totalElements: all.length,
      totalPages: all.length ? 1 : 0, first: true, last: true, empty: !all.length }); return true;
  }
  if (path === '/api/posts' && request.method === 'POST') { await save(request, response, null); return true; }
  const id = /^\/api\/posts\/([a-f0-9]{24})$/.exec(path)?.[1];
  if (id && posts.has(id)) {
    if (request.method === 'PUT') await save(request, response, posts.get(id));
    else { const post = publicPost(posts.get(id), request); send(response, post ? 200 : 404, post); }
    return true;
  }
  const slugMatch = /^\/api\/posts\/slug\/([^/]+)$/.exec(path);
  if (slugMatch) {
    const post = [...posts.values()].find(item => item.slug === decodeURIComponent(slugMatch[1]));
    if (!post) return false;
    const visible = publicPost(post, request); send(response, visible ? 200 : 404, visible); return true;
  }
  return false;
}
