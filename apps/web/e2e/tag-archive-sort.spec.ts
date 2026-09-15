import { expect, test } from '@playwright/test';

test('태그 인기순은 전체 결과를 정렬하고 페이지 이동과 새로고침에 유지된다', async ({ page }) => {
  await page.goto('/blog/tags/public?page=2');
  const sorting = page.getByRole('navigation', { name: '태그 포스트 정렬' });
  await sorting.getByRole('link', { name: '인기순' }).click();
  await expect(page).toHaveURL('/blog/tags/public?sort=popular');
  await expect(page.getByRole('heading', { level: 3, name: /^CI public/ }).first()).toHaveText('CI public 19 글');
  await expect(page.getByText('1 / 2 페이지 · 조회수가 높은 순')).toBeVisible();
  const pagination = page.getByRole('navigation', { name: 'Public 태그 페이지', exact: true });
  await pagination.getByRole('link', { name: '2페이지로 이동' }).click();
  await expect(page).toHaveURL('/blog/tags/public?sort=popular&page=2');
  await expect(page.getByRole('heading', { level: 3, name: /^CI public/ }).first()).toHaveText('CI public 7 글');
  await page.reload();
  await expect(sorting.getByRole('link', { name: '인기순' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { level: 3, name: /^CI public/ }).first()).toHaveText('CI public 7 글');
  await sorting.getByRole('link', { name: '최신순' }).click();
  await expect(page).toHaveURL('/blog/tags/public');
  await expect(page.getByRole('heading', { level: 3, name: /^CI public/ }).first()).toHaveText('CI public 1 글');
});

test('태그 인기순의 첫 페이지 리다이렉트는 정렬을 보존하고 잘못된 정렬은 거부한다', async ({ request }) => {
  const response = await request.get('/blog/tags/public?sort=popular&page=1', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/blog/tags/public?sort=popular');
  for (const sort of ['unknown', 'popular&sort=latest']) {
    expect((await request.get(`/blog/tags/public?sort=${sort}`)).status()).toBe(404);
  }
  const html = await (await request.get('/blog/tags/public?sort=popular')).text();
  expect(html).toContain('noindex');
  expect(html).toContain('<link rel="canonical" href="https://kscold.com/blog/tags/public"');
});
