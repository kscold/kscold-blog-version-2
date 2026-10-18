import { expect, test } from '@playwright/test';

test.describe('한살림 자료 페이지 링크 복사', () => {
  test('복사할 수 있으면 복사했다고 알린다', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/hansalim');

    await page.getByRole('button', { name: '페이지 링크 복사' }).click();
    await expect(page.getByRole('button', { name: '링크를 복사했습니다' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/hansalim$/);
    await expect(page.getByTestId('copy-link-fallback')).toHaveCount(0);
  });

  test('권한이 막히면 주소를 직접 고를 수 있게 보여 준다', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new DOMException('거절', 'NotAllowedError')) },
      });
    });
    await page.goto('/hansalim');

    await page.getByRole('button', { name: '페이지 링크 복사' }).click();
    const fallback = page.getByTestId('copy-link-fallback');
    await expect(fallback).toBeVisible();
    await expect(fallback.getByRole('textbox')).toHaveValue(/\/hansalim$/);
  });

  test('클립보드를 지원하지 않는 브라우저에서도 같은 안내를 보여 준다', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    });
    await page.goto('/hansalim');

    await page.getByRole('button', { name: '페이지 링크 복사' }).click();
    await expect(page.getByTestId('copy-link-fallback').getByRole('textbox')).toHaveValue(
      /\/hansalim$/
    );
  });
});
