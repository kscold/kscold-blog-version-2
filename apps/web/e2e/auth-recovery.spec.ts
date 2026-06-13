import { test, expect } from '@playwright/test';
import { success, mockApi } from './support/api';

test.describe('계정 복구 시나리오', () => {
  test('로그인 화면에서 아이디 찾기와 비밀번호 재설정 페이지로 자연스럽게 이어진다', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.locator('[data-cy="login-find-username"]').click();
    await expect(page).toHaveURL(/\/login\/recovery\?tab=username/);

    await page.locator('[data-cy="recovery-tab-password"]').click();
    await expect(page).toHaveURL(/\/login\/recovery\?tab=password/);
  });

  test('아이디 찾기는 이메일 입력 후 안내 메일 발송 완료 상태를 보여준다', async ({ page }) => {
    await page.route('**/api/auth/recover-username', async route => {
      expect(route.request().postDataJSON()).toEqual({ email: 'hello@kscold.com' });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(null, '가입한 이메일로 아이디 안내를 보냈습니다.')),
      });
    });

    await page.goto('/login/recovery?tab=username');
    await page.locator('[data-cy="recovery-email-input"]').fill('hello@kscold.com');
    await page.locator('[data-cy="recovery-submit"]').click();

    await expect(page.locator('[data-cy="recovery-success"]')).toContainText(
      '가입한 이메일로 아이디 안내를 보냈습니다'
    );
  });

  test('가입되지 않은 이메일로 비밀번호 재설정 시도 시 에러 메시지를 보여준다', async ({ page }) => {
    await mockApi(
      page,
      'POST',
      '**/api/auth/request-password-reset',
      {
        success: false,
        data: null,
        message: '가입되지 않은 이메일입니다.',
        errorCode: 'INVALID_INPUT',
        timestamp: '2026-04-13T00:00:00',
      },
      { status: 400 }
    );

    await page.goto('/login/recovery?tab=password');
    await page.locator('[data-cy="recovery-email-input"]').fill('notregistered@example.com');
    await page.locator('[data-cy="recovery-submit"]').click();

    await expect(page.locator('[data-cy="recovery-error"]')).toContainText('가입되지 않은 이메일입니다.');
    await expect(page.locator('[data-cy="recovery-success"]')).toHaveCount(0);
  });

  test('비밀번호 재설정 탭은 메일함으로 링크를 보내고 성공 상태를 보여준다', async ({ page }) => {
    await page.route('**/api/auth/request-password-reset', async route => {
      expect(route.request().postDataJSON()).toEqual({ email: 'hello@kscold.com' });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(null, '비밀번호 재설정 안내를 이메일로 보냈습니다.')),
      });
    });

    await page.goto('/login/recovery?tab=password');
    await page.locator('[data-cy="recovery-email-input"]').fill('hello@kscold.com');
    await page.locator('[data-cy="recovery-submit"]').click();

    await expect(page.locator('[data-cy="recovery-success"]')).toContainText(
      '비밀번호 재설정 링크를 이메일로 보냈습니다'
    );
  });

  test('유효한 재설정 링크는 새 비밀번호를 저장하고 완료 메시지를 보여준다', async ({ page }) => {
    await mockApi(
      page,
      'GET',
      '**/api/auth/password-reset/validate*',
      success({
        valid: true,
        message: '유효한 재설정 링크입니다.',
        expiresAt: '2026-04-13T10:30:00.000Z',
      })
    );

    await page.route('**/api/auth/reset-password', async route => {
      expect(route.request().postDataJSON()).toEqual({
        token: 'valid-token',
        newPassword: 'new-password-123',
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(null, '비밀번호를 다시 설정했습니다.')),
      });
    });

    await page.goto('/login/reset-password?token=valid-token');

    await page.locator('[data-cy="reset-password-input"]').fill('new-password-123');
    await page.locator('[data-cy="reset-password-confirm-input"]').fill('new-password-123');
    await page.locator('[data-cy="reset-password-submit"]').click();

    await expect(page.locator('[data-cy="reset-password-success"]')).toContainText(
      '새 비밀번호로 다시 로그인할 수 있습니다.'
    );
  });
});
