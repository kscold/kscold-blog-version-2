import { expect, test } from '@playwright/test';

test('게시글 하단의 이전글과 다음글을 왕복할 수 있다', async ({ page, request }) => {
  const response = await request.get('/blog/engineering/ci-frontend-verification');
  expect(await response.text()).toContain('href="/blog/engineering/ci-older"');
  await page.goto('/blog/engineering/ci-frontend-verification');
  const nav = page.getByRole('navigation', { name: '게시글 간 이동' });
  await expect(nav.getByRole('link')).toHaveCount(1);
  await nav.getByRole('link', { name: /이전글/ }).click();
  await expect(page).toHaveURL(/\/blog\/engineering\/ci-older$/);
  await expect(page.getByRole('heading', { name: 'CI 이전 글', exact: true })).toBeVisible();
  await nav.getByRole('link', { name: /다음글/ }).click();
  await expect(page).toHaveURL(/\/blog\/engineering\/ci-frontend-verification$/);
});
