import { expect, test } from '@playwright/test';

test('한글 slug 글도 상세 화면이 열린다', async ({ page }) => {
  const response = await page.goto(`/blog/engineering/${encodeURIComponent('한글-주소-글')}`);

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'CI 한글 주소 글' })).toBeVisible();
});
