import { test, expect, type Page } from '@playwright/test';
import { success, emptyPage, mockApi, mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';

async function mockAdminDashboardApis(page: Page) {
  await mockApi(page, 'GET', '**/api/posts/admin*', success(emptyPage(5)));
  await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage(1)));
  await mockApi(page, 'GET', '**/api/vault/notes*', success(emptyPage(1)));
  await mockApi(page, 'GET', '**/api/admin/chat/rooms', success([]));
}

test.describe('어드민 QA 진입 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
    await mockAdminDashboardApis(page);
  });

  test('관리자는 대시보드 빠른 작업에서 QA / E2E 페이지로 이동할 수 있다', async ({ page }) => {
    await seedAdminSession(page);

    await page.goto('/admin');

    const qaLink = page.locator('[data-cy="admin-qa-link"]');
    await expect(qaLink).toHaveAttribute('href', '/admin/testing');
    await qaLink.click();

    await expect(page).toHaveURL(/\/admin\/testing/);
    await expect(page.locator('[data-cy="admin-qa-page"]')).toContainText('QA / E2E');
  });

  test('관리자는 QA / E2E 페이지에서 주요 시나리오 링크와 실행 명령을 확인할 수 있다', async ({
    page,
  }) => {
    await seedAdminSession(page);

    await page.goto('/admin/testing');

    await expect(page.locator('[data-cy="admin-qa-scenario-home"]')).toHaveAttribute('href', '/');
    await expect(page.locator('[data-cy="admin-qa-scenario-guestbook"]')).toHaveAttribute(
      'href',
      '/guestbook'
    );
    await expect(page.locator('[data-cy="admin-qa-scenario-admin-chat"]')).toHaveAttribute(
      'href',
      '/admin/chat'
    );
    await expect(page.locator('[data-cy="admin-qa-command-run"]')).toContainText(
      'pnpm --dir apps/web test:e2e'
    );
    await expect(page.locator('[data-cy="admin-qa-command-open"]')).toContainText(
      'pnpm --dir apps/web'
    );
  });
});
