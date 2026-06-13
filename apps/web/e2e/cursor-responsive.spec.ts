import { test, expect } from '@playwright/test';
import { mockShellApis } from './support/api';

test.describe('반응형 커스텀 커서 동작', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
  });

  test('좁은 데스크탑 폭에서는 네이티브 커서를 유지한다', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/custom-cursor-active/);
  });

  test('넓은 데스크탑 폭에서는 커스텀 커서를 활성화한다', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/custom-cursor-active/);
  });

  test('모바일 폭에서는 커스텀 커서를 활성화하지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/custom-cursor-active/);
  });
});
