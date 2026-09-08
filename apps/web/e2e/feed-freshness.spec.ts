import { expect, test } from '@playwright/test';
import { mockApi, mockShellApis, pageOf, success } from './support/api';

test('목록 첫 방문도 서버 초기값에 머물지 않고 최신 공개 글을 조회한다', async ({ page }) => {
  await mockShellApis(page);
  await mockApi(page, 'GET', /\/api\/feeds(?:\?|$)/, success(pageOf([{
    id: 'fresh-feed', content: '# 방금 등록한 공개 글\n새 글 노출을 확인합니다.',
    images: [], tags: [], visibility: 'PUBLIC',
    author: { id: 'author-1', username: 'kscold', name: '김승찬' },
    likesCount: 0, commentsCount: 0, views: 0, isLiked: false,
    createdAt: '2026-09-08T15:00:00', updatedAt: '2026-09-08T15:00:00',
  }], 12)));
  await page.goto('/feed');
  await expect(page.getByRole('link', { name: '방금 등록한 공개 글 피드 보기' })).toBeVisible();
});

test('검색봇이 읽는 피드 HTML도 매 요청마다 백엔드 목록을 갱신한다', async ({ request }) => {
  const origin = process.env.BUILD_API_ORIGIN || 'http://127.0.0.1:4100';
  const countUrl = `${origin}/__request-count?pathname=${encodeURIComponent('/api/feeds')}`;
  const before = Number(await (await request.get(countUrl)).text());
  const first = await request.get('/feed');
  const second = await request.get('/feed');
  const after = Number(await (await request.get(countUrl)).text());
  expect(first.status()).toBe(200);
  expect(second.status()).toBe(200);
  expect(after - before).toBeGreaterThanOrEqual(2);
});
