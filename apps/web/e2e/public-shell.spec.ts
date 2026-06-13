import { test, expect } from '@playwright/test';
import { success, emptyPage, mockApi, mockShellApis } from './support/api';

test.describe('공개 페이지 핵심 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
  });

  test('방문자는 메인에서 새 소개 문구와 주요 CTA를 확인할 수 있다', async ({ page }) => {
    await page.goto('/');

    const tagline = page.locator('[data-cy="hero-tagline"]');
    await expect(tagline).toContainText('러닝커브를 즐기는 개발자');
    await expect(tagline).toContainText('문제를 서비스로 풀어내는');
    await expect(tagline).toContainText('프로덕트 엔지니어 김승찬입니다.');

    await expect(page.locator('[data-cy="hero-primary-cta"]')).toHaveAttribute('href', '/blog');
    await expect(page.locator('[data-cy="hero-secondary-cta"]')).toHaveAttribute('href', '/feed');
    await expect(page.locator('[data-cy="nav-link-guestbook"]')).toHaveAttribute('href', '/guestbook');
  });

  test('방문자는 Blog 링크를 클릭하면 블로그 목록 페이지로 이동한다', async ({ page }) => {
    await mockApi(page, 'GET', '**/api/posts/public*', success(emptyPage()));

    await page.goto('/');
    // hydration 리렌더가 끝나 motion 요소가 안정된 뒤 클릭
    await page.waitForLoadState('networkidle');
    await page.locator('[data-cy="hero-primary-cta"]').click();

    await expect(page).toHaveURL(/\/blog/);
  });

  test('방문자는 Feed 링크를 클릭하면 피드 페이지로 이동한다', async ({ page }) => {
    // feeds 목록만 매칭(feeds/tags 는 shell mock 이 처리하도록 제외)
    await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage()));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-cy="hero-secondary-cta"]').click();

    await expect(page).toHaveURL(/\/feed/);
  });

  test('비로그인 상태에서는 헤더에 LOGIN 버튼이 노출된다', async ({ page }) => {
    await page.goto('/');

    const loginBtn = page.locator('[data-cy="header-login-btn"]');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toContainText('LOGIN');
  });

  test('방문자는 헤더에서 방명록으로 이동해 빈 상태를 확인할 수 있다', async ({ page }) => {
    await mockApi(page, 'GET', '**/api/guestbook*', success(emptyPage(12)));

    await page.goto('/');
    await page.locator('[data-cy="nav-link-guestbook"]').click();

    await expect(page).toHaveURL(/\/guestbook/);
    await expect(page.locator('[data-cy="guestbook-title"]')).toContainText('방명록을 남겨주세요');
    await expect(page.locator('[data-cy="guestbook-empty-state"]')).toContainText(
      '첫 번째 인사를 남겨주세요.'
    );
  });
});
