import { test, expect } from '@playwright/test';
import { success, mockApi, mockShellApis } from './support/api';
import { seedSession } from './support/auth';

const DATE_TEST_USER = {
  id: 'date-user',
  email: 'date-user@example.com',
  username: 'date-user',
  displayName: '날짜 테스트 사용자',
  role: 'USER' as const,
};

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

  test('서버 날짜와 브라우저 날짜가 달라도 수화 뒤 서울 날짜로 안전하게 맞춘다', async ({ page }) => {
    const renderingErrors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') renderingErrors.push(message.text());
    });
    page.on('pageerror', error => renderingErrors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-09-06T15:30:00.000Z'));

    await page.goto('/admin-night');

    await expect(page.locator('[data-cy="admin-night-slot-tonight"]')).toHaveAttribute(
      'data-date',
      '2026-09-07'
    );
    await expect
      .poll(() => renderingErrors.filter(message => /hydration|#418|did not match/i.test(message)))
      .toEqual([]);
  });

  test('열린 탭이 서울 자정을 넘기면 보드와 신청일과 조회 범위를 함께 갱신한다', async ({ page }) => {
    const calendarRanges: string[] = [];
    await seedSession(page, DATE_TEST_USER);
    await mockApi(page, 'GET', '**/api/admin-night/requests/me', success([]));
    await page.route('**/api/admin-night/calendar*', async route => {
      const url = new URL(route.request().url());
      calendarRanges.push(`${url.searchParams.get('from')}|${url.searchParams.get('to')}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success([])),
      });
    });
    await page.clock.install({ time: new Date('2026-09-06T14:58:00.000Z') });

    await page.goto('/admin-night');
    await page.clock.pauseAt(new Date('2026-09-06T14:59:59.000Z'));
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));

    await expect(page.locator('[data-cy="admin-night-slot-tonight"]')).toHaveAttribute(
      'data-date',
      '2026-09-06'
    );
    await expect(page.locator('[data-cy="admin-night-date-option-2026-09-06"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect.poll(() => calendarRanges).toContain('2026-08-31|2026-09-06');

    await page.clock.runFor(2_100);

    await expect(page.locator('[data-cy="admin-night-slot-tonight"]')).toHaveAttribute(
      'data-date',
      '2026-09-07'
    );
    await expect(page.locator('[data-cy="admin-night-date-option-2026-09-07"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.locator('[data-cy="admin-night-date-option-2026-09-06"]')).toHaveCount(0);
    await expect.poll(() => calendarRanges).toContain('2026-09-07|2026-09-13');
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
