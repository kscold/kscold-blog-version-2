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

async function mockCurrentUser(page: Page, user: SessionUser) {
  await page.route('**/api/auth/me', async route => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: user,
        message: null,
        errorCode: null,
        timestamp: '2026-09-05T00:00:00',
      }),
    });
  });
}

/**
 * cy 의 seedAdminSession() 대응.
 * auth-token 쿠키 + localStorage(auth-storage)를 심어 어드민 로그인 상태를 만든다.
 * page.goto 전에 호출해야 하므로 addInitScript 로 localStorage 를 주입한다.
 */
export async function seedAdminSession(page: Page): Promise<string> {
  const accessToken = createAdminAccessToken();
  const user: SessionUser = {
    id: 'admin-1',
    email: 'developerkscold@gmail.com',
    username: 'kscold',
    displayName: '김승찬',
    role: 'ADMIN',
  };
  const persistedAuth = JSON.stringify({
    state: {
      user,
    },
    version: 0,
  });

  await mockCurrentUser(page, user);

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
    ({ auth }) => {
      try {
        window.localStorage.setItem('auth-storage', auth);
      } catch {
        /* localStorage 접근 불가 환경은 무시 */
      }
    },
    { auth: persistedAuth }
  );

  return accessToken;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
}

function createAccessToken(user: SessionUser): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    })
  );
  return `${header}.${payload}.signature`;
}

/** 임의 사용자(USER/ADMIN) 세션 시드 — cy 의 seedUserSession 대응 */
export async function seedSession(page: Page, user: SessionUser): Promise<string> {
  const accessToken = createAccessToken(user);
  const persistedAuth = JSON.stringify({
    state: { user },
    version: 0,
  });

  await mockCurrentUser(page, user);

  const url = new URL(baseURL);
  await page.context().addCookies([
    { name: 'auth-token', value: accessToken, domain: url.hostname, path: '/' },
  ]);

  await page.addInitScript(
    ({ auth }) => {
      try {
        window.localStorage.setItem('auth-storage', auth);
      } catch {
        /* noop */
      }
    },
    { auth: persistedAuth }
  );

  return accessToken;
}

/** auth-token 쿠키 제거 (cy.clearCookie 대응) */
export async function clearAuthCookie(page: Page): Promise<void> {
  await page.context().clearCookies({ name: 'auth-token' });
}
