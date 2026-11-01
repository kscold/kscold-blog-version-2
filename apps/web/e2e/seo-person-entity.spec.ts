import { expect, test, type APIRequestContext } from '@playwright/test';
import { toAuthorDisplayName } from '../src/entities/profile/model/profileData';
import { buildRssDocument } from '../src/shared/lib/seo/rss';
import type { PostSummary } from '../src/shared/model/types/blog';

type JsonLdNode = Record<string, unknown> & { '@type'?: string; '@id'?: string };

async function jsonLdNodes(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();
  const nodes: JsonLdNode[] = [];
  for (const [, body] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(body) as JsonLdNode & { '@graph'?: JsonLdNode[] };
    nodes.push(...(data['@graph'] ?? [data]));
  }
  return { html, nodes };
}

const rssPost = {
  id: 'rss-post', title: 'RSS 글', slug: 'rss-post', excerpt: 'RSS 요약', content: null,
  category: { id: 'c', name: '개발 이야기', slug: 'dev-story' }, tags: [],
  author: { id: 'a', name: 'kscold' }, status: 'PUBLISHED', featured: false, restricted: false,
  views: 0, likes: 0, publishedAt: '2026-11-01T00:00:00Z', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
} as unknown as PostSummary;

test('홈 첫 제목과 사이트 Person은 블로그 주인 이름을 담는다', async ({ page, request }) => {
  const { nodes } = await jsonLdNodes(request, '/');
  const person = nodes.find(node => node['@type'] === 'Person');
  expect(person?.name).toBe('김승찬');
  expect(person?.alternateName).toEqual(expect.arrayContaining(['kscold', 'Seungchan Kim']));
  expect(person?.sameAs).toEqual(expect.arrayContaining(['https://github.com/kscold']));

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('김승찬의 기술 블로그');
  // 검색 결과 제목에는 블로그 이름과 하는 일이 함께 보여야 한다.
  await expect(page).toHaveTitle('김승찬의 기술 블로그 - AI Agent·백엔드·프론트엔드 개발자');
  await expect(page.locator('footer').getByRole('link', { name: '김승찬', exact: true })).toHaveAttribute('href', '/info');
});

test('소개 페이지는 이름이 먼저 오는 제목과 인물 정보를 담은 ProfilePage를 제공한다', async ({ request }) => {
  const { html, nodes } = await jsonLdNodes(request, '/info');
  expect(html).toMatch(/<title>김승찬\(kscold\) - AI Agent·백엔드·프론트엔드 개발자/);
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  expect(description).toContain('김승찬');
  // 괄호가 걷혀 "김승찬 kscold ." 처럼 끊긴 문장이 나오지 않아야 한다.
  expect(description).not.toMatch(/\s\.\s/);

  const profile = nodes.find(node => node['@type'] === 'ProfilePage');
  const person = profile?.mainEntity as JsonLdNode | undefined;
  expect(person?.['@type']).toBe('Person');
  expect(person?.['@id']).toBe('https://kscold.com/#person');
  expect(person?.name).toBe('김승찬');
  expect(person?.image).toBeTruthy();
  expect(person?.sameAs).toEqual(expect.arrayContaining(['https://github.com/kscold']));
  expect(person?.jobTitle).toBe('AI Agent·백엔드·프론트엔드 개발자');
});

test('소개 페이지는 분야별로 하는 일을 이름과 함께 보여준다', async ({ page }) => {
  await page.goto('/info');
  const work = page.locator('section[aria-labelledby="info-work"]');
  for (const heading of ['AI Agent 개발', '백엔드 개발', '프론트엔드 개발']) {
    const card = work.locator('article').filter({ has: page.getByRole('heading', { level: 3, name: heading, exact: true }) });
    await expect(card).toContainText('김승찬은');
  }
  await expect(page.getByRole('heading', { level: 3, name: '김승찬은 어떤 서비스를 만들었나요?' })).toBeVisible();
});

test('블로그 주인 계정(kscold)이 쓴 글은 작성자를 실명으로 보여준다', () => {
  expect(toAuthorDisplayName({ name: 'kscold' })).toBe('김승찬');
  expect(toAuthorDisplayName({ name: 'KSCOLD ' })).toBe('김승찬');
  expect(toAuthorDisplayName({ name: '피드유저', username: 'kscold' })).toBe('김승찬');
  expect(toAuthorDisplayName({ name: '작성자' })).toBe('작성자');
});

test('블로그 주인이 쓴 글 끝에는 글쓴이 칸과 소개 링크가 있다', async ({ page }) => {
  // CI 가짜 API의 글(작성자 김승찬)을 쓴다.
  await page.goto('/blog/engineering/ci-frontend-verification');
  const card = page.getByRole('complementary', { name: '글쓴이' });
  await expect(card).toContainText('김승찬');
  await expect(card).toContainText('AI Agent·백엔드·프론트엔드 개발자');
  await expect(card.getByRole('link', { name: '김승찬 소개 보기' })).toHaveAttribute('href', '/info');
});

test('RSS 글마다 작성자 실명을 싣는다', () => {
  const xml = buildRssDocument([rssPost], { authorName: post => toAuthorDisplayName(post.author) });
  expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
  expect(xml).toContain('<dc:creator>김승찬</dc:creator>');
});
