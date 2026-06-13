import { test, expect } from '@playwright/test';
import { mockShellApis } from './support/api';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';

test.describe('회원가입 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
  });

  test('짧은 비밀번호는 서버 요청 전 프런트에서 바로 안내한다', async ({ page }) => {
    let registerCalls = 0;
    await page.route('**/api/auth/register', async route => {
      registerCalls += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/login');
    await page.locator('[data-cy="auth-toggle-register"]').click();

    await page.locator('[data-cy="register-email-input"]').fill('short-password@example.com');
    await page.locator('[data-cy="register-username-input"]').fill('gom');
    await page.locator('[data-cy="register-display-name-input"]').fill('ㄱㄱㅁ');
    const passwordInput = page.locator('[data-cy="register-password-input"]');
    await passwordInput.fill('1234');
    await page.locator('[data-cy="register-submit"]').click();

    // 짧은 비밀번호는 HTML5 minLength 검증에서 막혀 서버 요청 자체가 가지 않는다
    const isInvalid = await passwordInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid && el.validity.tooShort
    );
    expect(isInvalid).toBe(true);
    expect(registerCalls).toBe(0);
    await expect(page).toHaveURL(/\/login/);
  });

  test('서버가 400을 내려도 회원가입 폼은 검증 메시지를 그대로 보여준다', async ({ page }) => {
    await page.route('**/api/auth/register', async route => {
      const body = route.request().postDataJSON();
      expect(body.username).toBe('gom');
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '비밀번호는 최소 8자 이상이어야 합니다',
          errorCode: 'E001',
          timestamp: '2026-04-14T16:21:02.465+09:00',
        }),
      });
    });

    await page.goto('/login');
    await page.locator('[data-cy="auth-toggle-register"]').click();

    await page.locator('[data-cy="register-email-input"]').fill('server-validation@example.com');
    await page.locator('[data-cy="register-username-input"]').fill('gom');
    await page.locator('[data-cy="register-display-name-input"]').fill('ㄱㄱㅁ');
    await page.locator('[data-cy="register-password-input"]').fill('12345678');
    await page.locator('[data-cy="register-submit"]').click();

    const errorBox = page.locator('[data-cy="auth-form-error"]');
    await expect(errorBox).toContainText('비밀번호는 최소 8자 이상이어야 합니다');
    await expect(errorBox).not.toContainText('Request failed with status code 400');
  });

  test('유효한 영문 사용자명과 비밀번호면 회원가입 응답을 정상 처리한다', async ({ page }) => {
    await page.route('**/api/auth/register', async route => {
      const body = route.request().postDataJSON();
      expect(body).toEqual({
        email: 'korean-register@example.com',
        username: 'gom',
        displayName: 'ㄱㄱㅁ',
        password: 'validpass123',
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            tokenType: 'Bearer',
            user: {
              id: 'user-1',
              email: 'korean-register@example.com',
              username: 'gom',
              displayName: 'ㄱㄱㅁ',
              role: 'USER',
            },
          },
          message: '회원가입이 완료되었습니다.',
          errorCode: null,
          timestamp: '2026-04-14T00:00:00',
        }),
      });
    });

    await page.goto('/login');
    await page.locator('[data-cy="auth-toggle-register"]').click();

    await page.locator('[data-cy="register-email-input"]').fill('korean-register@example.com');
    await page.locator('[data-cy="register-username-input"]').fill('gom');
    await page.locator('[data-cy="register-display-name-input"]').fill('ㄱㄱㅁ');
    await page.locator('[data-cy="register-password-input"]').fill('validpass123');
    await page.locator('[data-cy="register-submit"]').click();

    await expect(page).toHaveURL(`${baseURL}/`);
  });
});
