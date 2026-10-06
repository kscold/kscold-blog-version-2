import { expect, test } from '@playwright/test';
import { mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';
import { mockPrivatePdf } from './support/privatePdf';

test.use({ navigationTimeout: 30_000 });
test.setTimeout(60_000);

for (const width of [390, 440]) {
  test(`${width}px 모바일에서 PDF와 모든 도구를 가로 넘침 없이 조작한다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 956 });
    await mockShellApis(page);
    await seedAdminSession(page);
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-testid="pdf-page-1"] canvas')).toBeVisible();
    for (const control of ['next', 'previous', 'zoom-in', 'zoom-out', 'fit', 'rotate']) {
      await expect(page.locator(`[data-testid="pdf-viewer-${control}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-testid="pdf-viewer-page-input"]')).toBeVisible();
    await expect.poll(() => page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth
    )).toBe(true);
    await page.locator('[data-testid="pdf-viewer-next"]').click();
    await expect(page.locator('[data-testid="pdf-viewer-page-input"]')).toHaveValue('2');
    await page.locator('[data-testid="pdf-viewer-zoom-in"]').click();
    await expect.poll(() => page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth
    )).toBe(true);
    await page.locator('[data-testid="pdf-viewer-fit"]').click();
    await page.locator('[data-testid="pdf-viewer-rotate"]').click();
    await expect(page.locator('[data-testid="pdf-viewer-scroll"]')).toHaveAttribute('data-rotation', '90');
    await expect.poll(() => page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth
    )).toBe(true);
  });
}

test('모바일 두 손가락 확대는 페이지 안에서 적용하고 화면 맞춤으로 돌아간다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockShellApis(page);
  await seedAdminSession(page);
  await mockPrivatePdf(page);
  await page.goto('/admin/documents/doc-1/view');
  await expect(page.locator('[data-testid="pdf-page-1"] canvas')).toBeVisible();
  const scroll = page.locator('[data-testid="pdf-viewer-scroll"]');
  await expect(scroll).toHaveAttribute('data-scale', '1');
  await scroll.evaluate(container => {
    const touch = (identifier: number, clientX: number) => new Touch({
      identifier, target: container, clientX, clientY: 200,
    });
    const start = [touch(1, 100), touch(2, 200)];
    const expanded = [touch(1, 75), touch(2, 225)];
    container.dispatchEvent(new TouchEvent('touchstart', { touches: start, bubbles: true }));
    container.dispatchEvent(new TouchEvent('touchmove', {
      touches: expanded, bubbles: true, cancelable: true,
    }));
    container.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
  });
  await expect(scroll).toHaveAttribute('data-scale', '1.5');
  await expect(page.locator('[data-testid="pdf-page-1"] canvas')).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth
  )).toBe(true);
  await page.locator('[data-testid="pdf-viewer-fit"]').click();
  await expect(scroll).toHaveAttribute('data-scale', '1');
});
