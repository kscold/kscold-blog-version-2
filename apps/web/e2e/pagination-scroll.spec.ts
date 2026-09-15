import { expect, test } from '@playwright/test';
import { mockShellApis, pageOf, success } from './support/api';

for (const width of [390, 1440]) {
  test(`블로그 1~5페이지 왕복은 항상 상단에서 시작한다: ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/blog');
    const nav = page.getByRole('navigation', { name: '블로그 페이지' });
    for (const number of [2, 3, 4, 5, 1, 3]) {
      await nav.getByRole('link', { name: `${number}페이지로 이동`, exact: true }).click();
      await expect(nav.locator('[aria-current="page"]')).toHaveText(String(number));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    }
  });
}

test('피드의 미캐시·캐시 페이지 모두 목록 교체 후 상단을 유지한다', async ({ page }) => {
  await mockShellApis(page);
  await page.route(/\/api\/feeds(?:\?|$)/, async route => {
    const number = Number(new URL(route.request().url()).searchParams.get('page') || 0);
    const feeds = Array.from({ length: 12 }, (_, i) => ({
      id: `scroll-${number}-${i}`, content: `# 페이지 ${number + 1} 글 ${i + 1}\n${'스크롤 검증 본문입니다. '.repeat(25)}`,
      images: [], tags: [], author: { id: 'author', name: '작성자' },
      likesCount: 0, commentsCount: 0, isLiked: false, visibility: 'PUBLIC',
      createdAt: '2026-09-15T00:00:00Z', updatedAt: '2026-09-15T00:00:00Z',
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    await route.fulfill({ json: success({ ...pageOf(feeds, 12), number, totalPages: 5, totalElements: 60 }) });
  });
  await page.goto('/feed');
  await expect(page.getByRole('heading', { name: '페이지 1 글 1', exact: true })).toBeVisible();
  for (const number of [2, 3, 4, 5, 1, 2]) {
    await page.getByRole('button', { name: `${number}페이지로 이동`, exact: true }).click();
    await expect(page.getByRole('heading', { name: `페이지 ${number} 글 1`, exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
});
