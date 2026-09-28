import { expect, test } from '@playwright/test';
import { emptyPage, mockShellApis, success } from './support/api';
import { createAdminAccessToken, seedAdminSession } from './support/auth';

test('개인 문서 로그인 복귀는 공개 화면의 스크립트 상태를 공유하지 않는다', async ({ page }) => {
  test.setTimeout(60000);
  await mockShellApis(page);
  await page.route('**/api/admin/documents**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success(emptyPage(12))),
    })
  );
  await page.route('**/api/auth/login', async route => {
    const token = await seedAdminSession(page);
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: token,
        url: new URL(page.url()).origin,
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        success({
          user: {
            id: 'admin-1',
            email: 'admin@example.test',
            username: 'kscold',
            displayName: '관리자',
            role: 'ADMIN',
          },
        })
      ),
    });
  });

  await page.goto('/login?redirect=%2Fadmin%2Fdocuments');
  await expect(page.locator('[data-cy="login-submit"]')).toBeEnabled({ timeout: 30000 });
  await page.evaluate(() => {
    Object.assign(window, { privateNavigationSentinel: true });
  });
  await page.locator('[data-cy="login-email-input"]').fill('admin@example.test');
  await page.locator('[data-cy="login-password-input"]').fill('test-only-password');
  await page.locator('[data-cy="login-submit"]').click();

  await expect(page).toHaveURL(/\/admin\/documents$/);
  await expect(page.locator('[data-cy="admin-documents-page"]')).toBeVisible();
  const retainedState = await page.evaluate(() => 'privateNavigationSentinel' in window);
  expect(retainedState).toBe(false);
});

test('쿠키만 남은 관리자는 서버 권한 확인 뒤에 개인 문서를 조회한다', async ({ page }) => {
  await mockShellApis(page);
  await page.context().addCookies([
    {
      name: 'auth-token',
      value: createAdminAccessToken(),
      url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101',
      httpOnly: true,
    },
  ]);
  let verified = false;
  await page.route('**/api/auth/me', async route => {
    verified = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        success({
          id: 'cookie-admin',
          username: 'kscold',
          displayName: '관리자',
          email: 'admin@example.test',
          role: 'ADMIN',
        })
      ),
    });
  });
  await page.route('**/api/admin/documents**', async route => {
    expect(verified).toBe(true);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success(emptyPage(12))),
    });
  });
  await page.goto('/admin/documents');
  await expect(page.locator('[data-cy="admin-documents-page"]')).toBeVisible();
  expect(verified).toBe(true);
});

test('세션 확인 실패는 개인 문서를 열지 않으며 명시적으로 다시 확인할 수 있다', async ({
  page,
}) => {
  await mockShellApis(page);
  await page.context().addCookies([
    {
      name: 'auth-token',
      value: createAdminAccessToken(),
      url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101',
      httpOnly: true,
    },
  ]);
  let isAllowed = false;
  let listRequests = 0;
  await page.route('**/api/auth/me', route =>
    route.fulfill({
      status: isAllowed ? 200 : 401,
      contentType: 'application/json',
      body: JSON.stringify(
        isAllowed
          ? success({
              id: 'cookie-admin',
              username: 'kscold',
              email: 'admin@example.test',
              role: 'ADMIN',
              displayName: '관리자',
            })
          : { success: false }
      ),
    })
  );
  await page.route('**/api/admin/documents**', async route => {
    listRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success(emptyPage(12))),
    });
  });
  await page.goto('/admin/documents');
  await expect(page.locator('[data-cy="admin-documents-auth-required"]')).toBeVisible();
  expect(listRequests).toBe(0);
  await expect(page).toHaveURL(/\/admin\/documents$/);
  isAllowed = true;
  await page.locator('[data-cy="admin-documents-verify-session"]').click();
  await expect(page.locator('[data-cy="admin-documents-page"]')).toBeVisible();
  expect(listRequests).toBeGreaterThan(0);
});
