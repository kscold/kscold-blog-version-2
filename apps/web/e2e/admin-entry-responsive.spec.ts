import { test, expect, type Page } from '@playwright/test';
import { mockShellApis, mockAdminDashboardApis } from './support/api';
import { seedAdminSession } from './support/auth';
import { expectWithinViewport } from './support/dom';

const mobileViewports = [
  { label: 'iphone-se', width: 320, height: 568 },
  { label: 'galaxy-s8', width: 360, height: 740 },
  { label: 'iphone-14', width: 390, height: 844 },
  { label: 'iphone-14-plus', width: 430, height: 932 },
  { label: 'ipad-mini', width: 768, height: 1024 },
];

const desktopViewports = [
  { label: 'small-laptop', width: 1024, height: 768 },
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'wide-desktop', width: 1440, height: 900 },
];

async function visitAsAdmin(page: Page, width: number, height: number) {
  await mockShellApis(page);
  await mockAdminDashboardApis(page);
  await seedAdminSession(page);
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await expect(page.locator('[data-cy="header-auth-loading"]')).toHaveCount(0);
}

test.describe('관리자 진입 반응형 시나리오', () => {
  for (const { label, width, height } of mobileViewports) {
    test(`${label} 해상도에서는 사이드바에서 Admin으로 이동할 수 있다`, async ({ page }) => {
      await visitAsAdmin(page, width, height);

      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        overflowingElements: Array.from(document.querySelectorAll<HTMLElement>('body *'))
          .map(element => ({
            element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${Array.from(element.classList).join('.')}`,
            right: Math.round(element.getBoundingClientRect().right),
          }))
          .filter(element => element.right > window.innerWidth)
          .slice(0, 5),
      }));
      expect(layout.scrollWidth, JSON.stringify(layout.overflowingElements)).toBeLessThanOrEqual(width);

      // 사이드바는 데스크탑·모바일 두 벌이 렌더되어 CSS 로 숨겨지므로 :visible 로 좁힌다
      await expectWithinViewport(page, '[data-cy="sidebar-toggle"]:visible', width);
      await page.locator('[data-cy="sidebar-toggle"]:visible').click();
      await expectWithinViewport(page, '[data-cy="sidebar-link-admin"]:visible', width);
      await page.locator('[data-cy="sidebar-link-admin"]:visible').click();

      await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
      await expect(page.getByText('Dashboard').first()).toBeVisible();
    });
  }

  for (const { label, width, height } of desktopViewports) {
    test(`${label} 해상도에서는 헤더에서 Admin으로 이동할 수 있다`, async ({ page }) => {
      await visitAsAdmin(page, width, height);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);

      await expectWithinViewport(page, '[data-cy="admin-header-link"]', width);
      await page.locator('[data-cy="admin-header-link"]').click();

      await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
      await expect(page.getByText('Dashboard').first()).toBeVisible();
    });
  }
});
