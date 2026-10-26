import { test, expect } from '@playwright/test';
import { isolateBackendApi, mockShellApis, success } from './support/api';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';

test.describe('회원가입 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await isolateBackendApi(page);
    await mockShellApis(page);
  });

  test('짧은 비밀번호는 서버 요청 전 프런트에서 바로 안내한다', async ({ page }) => {
    let registerCalls = 0;
    await page.route('**/api/auth/register', async route => {
      registerCalls += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/login');
    await page.locator('[data-testid="auth-toggle-register"]').click();

    await page.locator('[data-testid="register-email-input"]').fill('short-password@example.com');
    await page.locator('[data-testid="register-username-input"]').fill('gom');
    await page.locator('[data-testid="register-display-name-input"]').fill('ㄱㄱㅁ');
    const passwordInput = page.locator('[data-testid="register-password-input"]');
    await passwordInput.fill('1234');
    await page.locator('[data-testid="register-submit"]').click();

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
    await page.locator('[data-testid="auth-toggle-register"]').click();

    await page.locator('[data-testid="register-email-input"]').fill('server-validation@example.com');
    await page.locator('[data-testid="register-username-input"]').fill('gom');
    await page.locator('[data-testid="register-display-name-input"]').fill('ㄱㄱㅁ');
    await page.locator('[data-testid="register-password-input"]').fill('12345678');
    await page.locator('[data-testid="register-submit"]').click();

    const errorBox = page.locator('[data-testid="auth-form-error"]');
    await expect(errorBox).toContainText('비밀번호는 최소 8자 이상이어야 합니다');
    await expect(errorBox).not.toContainText('Request failed with status code 400');
  });

  test('유효한 영문 사용자명과 비밀번호면 회원가입 응답을 정상 처리한다', async ({ page }) => {
    const user = {
      id: 'user-1', email: 'korean-register@example.com',
      username: 'gom', displayName: 'ㄱㄱㅁ', role: 'USER',
    };
    let registered = false;
    let refreshCalls = 0;
    await page.route('**/api/auth/me', async route => {
      // 가입 후 세션 확인까지 같은 사용자를 반환해야 성공한 가입을 검증할 수 있다.
      expect(registered).toBe(true);
      await route.fulfill({ json: success(user) });
    });
    await page.route('**/api/auth/refresh', async route => {
      refreshCalls += 1;
      await route.fulfill({ status: 401, json: { success: false } });
    });
    await page.route('**/api/auth/register', async route => {
      const body = route.request().postDataJSON();
      expect(body).toEqual({
        email: 'korean-register@example.com',
        username: 'gom',
        displayName: 'ㄱㄱㅁ',
        password: 'validpass123',
      });
      registered = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'set-cookie': 'auth-token=ci-register-session; Path=/; HttpOnly; SameSite=Lax' },
        body: JSON.stringify({
          success: true,
          data: { user },
          message: '회원가입이 완료되었습니다.',
          errorCode: null,
          timestamp: '2026-04-14T00:00:00',
        }),
      });
    });

    await page.goto('/login');
    await page.locator('[data-testid="auth-toggle-register"]').click();

    await page.locator('[data-testid="register-email-input"]').fill('korean-register@example.com');
    await page.locator('[data-testid="register-username-input"]').fill('gom');
    await page.locator('[data-testid="register-display-name-input"]').fill('ㄱㄱㅁ');
    await page.locator('[data-testid="register-password-input"]').fill('validpass123');
    // 성공 응답이 기존 브라우저 토큰도 정리하는지 확인한다. 초기 복원 뒤에만 심는다.
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'ci-legacy-access');
      localStorage.setItem('refreshToken', 'ci-legacy-refresh');
    });
    const identityResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/me');
    await page.locator('[data-testid="register-submit"]').click();
    expect((await identityResponse).status()).toBe(200);

    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.getByRole('button', { name: 'Logout', exact: true })).toBeVisible();
    expect(await page.evaluate(() => ({
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userId: JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.user?.id,
    }))).toEqual({ accessToken: null, refreshToken: null, userId: user.id });
    const cookies = await page.context().cookies();
    expect(cookies.find(cookie => cookie.name === 'auth-token')).toMatchObject({ httpOnly: true });
    expect(refreshCalls).toBe(0);
  });
});
