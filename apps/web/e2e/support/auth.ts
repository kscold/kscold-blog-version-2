import type { Page } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/** ADMIN 역할의 가짜 JWT access token (서명은 검증하지 않는 미들웨어용) */
export function createAdminAccessToken(): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'admin-1',
      role: 'ADMIN',
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    })
  );
  return `${header}.${payload}.signature`;
}

/**
 * cy 의 seedAdminSession() 대응.
 * auth-token 쿠키 + localStorage(auth-storage 등)를 심어 어드민 로그인 상태를 만든다.
 * page.goto 전에 호출해야 하므로 addInitScript 로 localStorage 를 주입한다.
 */
export async function seedAdminSession(page: Page): Promise<string> {
  const accessToken = createAdminAccessToken();
  const persistedAuth = JSON.stringify({
    state: {
      user: {
        id: 'admin-1',
        email: 'developerkscold@gmail.com',
        username: 'kscold',
        displayName: '김승찬',
        role: 'ADMIN',
      },
      token: accessToken,
    },
    version: 0,
  });

  const url = new URL(baseURL);
  await page.context().addCookies([
    {
      name: 'auth-token',
      value: accessToken,
      domain: url.hostname,
      path: '/',
    },
  ]);

  await page.addInitScript(
    ({ token, auth }) => {
      try {
        window.localStorage.setItem('accessToken', token);
        window.localStorage.setItem('refreshToken', 'fake-refresh-token');
        window.localStorage.setItem('auth-storage', auth);
      } catch {
        /* localStorage 접근 불가 환경은 무시 */
      }
    },
    { token: accessToken, auth: persistedAuth }
  );

  return accessToken;
}

/** auth-token 쿠키 제거 (cy.clearCookie 대응) */
export async function clearAuthCookie(page: Page): Promise<void> {
  await page.context().clearCookies({ name: 'auth-token' });
}
