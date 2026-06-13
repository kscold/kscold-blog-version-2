import { expect, type Page } from '@playwright/test';

/** 문서가 가로 스크롤(가로 깨짐) 없이 주어진 폭 안에 들어가는지 검증 */
export async function expectNoHorizontalOverflow(page: Page, width: number): Promise<void> {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(width + 1);
}

export const VIEWPORTS = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'desktop', width: 1440, height: 900 },
] as const;

/** 요소가 보이고, 가로로 뷰포트 폭 안에 들어오는지 검증 */
export async function expectWithinViewport(
  page: Page,
  selector: string,
  width: number
): Promise<void> {
  const locator = page.locator(selector);
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  }
}
