import { expect, test } from '@playwright/test';
import { mockShellApis, success } from './support/api';

const legacyUser = {
  id: 'admin-1',
  email: 'developerkscold@gmail.com',
  username: 'kscold',
  displayName: '김승찬',
  role: 'ADMIN' as const,
};

test('기존 브라우저 토큰을 쿠키 세션으로 승격한 뒤 localStorage에서 제거한다', async ({
  page,
}) => {
  await mockShellApis(page);

  let refreshCalls = 0;
  await page.route('**/api/auth/refresh', async route => {
    refreshCalls += 1;
    expect(route.request().postDataJSON()).toEqual({ refreshToken: 'legacy-refresh-token' });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success({ user: legacyUser })),
    });
  });
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success(legacyUser)),
    });
  });
  await page.addInitScript(user => {
    window.localStorage.setItem('accessToken', 'legacy-access-token');
    window.localStorage.setItem('refreshToken', 'legacy-refresh-token');
    window.localStorage.setItem('auth-storage', JSON.stringify({ state: { user }, version: 0 }));
  }, legacyUser);

  await page.goto('/');

  await expect(page.locator('[data-cy="admin-header-link"]')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        accessToken: window.localStorage.getItem('accessToken'),
        refreshToken: window.localStorage.getItem('refreshToken'),
      }))
    )
    .toEqual({ accessToken: null, refreshToken: null });
  expect(refreshCalls).toBe(1);
});
