import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`${width}px 피드 제목은 읽기 편한 줄 간격으로 화면 안에 표시된다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/feed/ci-like-feed');
    const heading = page.locator('.markdown-source-h1');
    await expect(heading).toBeVisible();
    await expect(async () => {
      const metrics = await heading.evaluate(element => {
        const style = getComputedStyle(element);
        const size = parseFloat(style.fontSize);
        return {
          size,
          lineHeight: parseFloat(style.lineHeight) / size,
          letterSpacing: parseFloat(style.letterSpacing) / size,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(metrics.size).toBeGreaterThan(0);
      expect(metrics.size).toBeLessThanOrEqual(width < 640 ? 30 : 38);
      expect(metrics.lineHeight).toBeGreaterThanOrEqual(1.3);
      expect(metrics.letterSpacing).toBeGreaterThan(-0.02);
      expect(metrics.overflow).toBeLessThanOrEqual(1);
    }).toPass({ timeout: 10_000 });
  });
}
