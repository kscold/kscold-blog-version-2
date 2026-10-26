import { expect, test, type Page } from '@playwright/test';
import { createAdminAccessToken, createVerifiedAdminAccessToken } from './support/auth';

// 시험용 설정(e2e/fixtures/search-insights)만 읽는다. 서비스 계정 키가 없으니 구글에는 요청하지 않는다.
const PAGE_PATH = '/admin/search';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';

async function setAuthCookie(page: Page, token: string) {
  await page
    .context()
    .addCookies([
      { name: 'auth-token', value: token, domain: new URL(baseURL).hostname, path: '/' },
    ]);
}

test.describe('관리자 검색 유입 화면', () => {
  test('로그인하지 않으면 로그인 화면으로 보낸다', async ({ page }) => {
    await page.goto(PAGE_PATH);
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Fsearch/);
  });

  test('모양만 관리자인 토큰은 백엔드 확인에서 걸러진다', async ({ page }) => {
    await setAuthCookie(page, createAdminAccessToken());
    await page.goto(PAGE_PATH);
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test('관리자는 색인 현황을 보고, 키가 없는 구글 영역은 안내만 본다', async ({ page }) => {
    await setAuthCookie(page, createVerifiedAdminAccessToken());
    await page.goto(PAGE_PATH);

    const dashboard = page.getByTestId('search-insights');
    await expect(dashboard).toBeVisible();
    await expect(dashboard.getByText('1 / 3')).toBeVisible();
    await expect(dashboard.getByText('Google에는 아직 알려지지 않은 URL입니다.')).toBeVisible();
    await expect(dashboard.getByRole('alert').first()).toContainText(
      '서비스 계정 키가 배포되지 않았습니다'
    );
  });
});
