import { test, expect } from '@playwright/test';
import { success, mockApi, mockShellApis } from './support/api';

test.describe('Admin Night 공개 페이지 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
    await mockApi(page, 'GET', '**/api/admin-night/calendar*', success([]));
  });

  test('헤더 네비게이션에서 공개 Admin Night 페이지로 이동할 수 있다', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/');
    await page.locator('[data-cy="nav-link-admin-night"]').click();

    await expect(page).toHaveURL(/\/admin-night/);
    await expect(page.getByText('퇴근 후, 각자 할 일을 끝내는 밤')).toBeVisible();
    await expect(page.getByText('신청 PR ➔ Merge / Meet')).toBeVisible();
    await expect(page.locator('[data-cy="admin-night-hero-primary"]')).toHaveAttribute(
      'href',
      '#admin-night-request'
    );

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(1600);

    await page.screenshot({ path: 'test-results/screenshots/admin-night-page-desktop.png' });
  });

  test('모바일에서도 Admin Night 페이지가 가로로 깨지지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin-night');

    await expect(page.getByText('각자 할 일을 끝내는 밤')).toBeVisible();
    await expect(page.locator('[data-cy="admin-night-slot-tonight"]')).toBeAttached();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    await page.screenshot({ path: 'test-results/screenshots/admin-night-page-mobile.png' });
  });

  test('AI Agent Bloom은 확정되지 않은 일정을 이벤트로 선언하지 않는다', async ({ page }) => {
    await page.goto('/admin-night/ai-agent-bloom');

    const jsonLd = await page.locator('#ai-agent-bloom-page').textContent();
    expect(jsonLd).not.toBeNull();
    const schema = JSON.parse(jsonLd || '{}');

    expect(schema['@type']).toBe('Service');
    expect(schema.serviceType).toContain('AI Agent');
    expect(schema).not.toHaveProperty('eventStatus');
    expect(schema).not.toHaveProperty('eventAttendanceMode');
    expect(schema).not.toHaveProperty('startDate');
    expect(schema).not.toHaveProperty('location');
  });
});
