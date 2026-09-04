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
    await expect(tagline).toContainText('AI Agent부터 서버·웹까지');
    await expect(tagline).toContainText('문제를 서비스로 풀어내는');
    await expect(tagline).toContainText('김승찬입니다.');

    await expect(page.locator('[data-cy="hero-primary-cta"]')).toHaveAttribute('href', '/blog');
    await expect(page.locator('[data-cy="hero-secondary-cta"]')).toHaveAttribute('href', '/feed');
    await expect(page.locator('[data-cy="nav-link-guestbook"]')).toHaveAttribute('href', '/guestbook');
  });

  test('방문자는 Blog 링크를 클릭하면 블로그 목록 페이지로 이동한다', async ({ page }) => {
    await mockApi(page, 'GET', '**/api/posts/public*', success(emptyPage()));

    await page.goto('/');
    const blogLink = page.locator('[data-cy="hero-primary-cta"]');
    await expect(blogLink).toBeVisible();
    await blogLink.click();

    await expect(page).toHaveURL(/\/blog/);
  });

  test('추천 글 카드는 유효한 링크 구조와 충분한 태그 터치 영역을 제공한다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /글 읽기/ }).first()).toBeVisible();
    await expect(page.locator('a a')).toHaveCount(0);

    const firstTag = page.locator('a[href^="/tags/"]').first();
    await expect(firstTag).toBeVisible();
    const tagBox = await firstTag.boundingBox();
    expect(tagBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('방문자는 Feed 링크를 클릭하면 피드 페이지로 이동한다', async ({ page }) => {
    // feeds 목록만 매칭(feeds/tags 는 shell mock 이 처리하도록 제외)
    await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage()));

    await page.goto('/');
    const feedLink = page.locator('[data-cy="hero-secondary-cta"]');
    await expect(feedLink).toBeVisible();
    await feedLink.click();

    await expect(page).toHaveURL(/\/feed/);
  });

  test('Feed URL 태그 필터를 클라이언트에서 적용한다', async ({ page }) => {
    let requestedTag: string | null = null;
    await page.route(/\/api\/feeds(?:\?|$)/, async route => {
      requestedTag = new URL(route.request().url()).searchParams.get('tag');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(emptyPage(12))),
      });
    });

    await page.goto('/feed?tag=LangGraph');

    await expect(page.getByText('#LangGraph 피드가 없습니다', { exact: true })).toBeVisible();
    expect(requestedTag).toBe('LangGraph');
  });

  test('비로그인 상태에서는 헤더에 LOGIN 버튼이 노출된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-cy="header-auth-loading"]')).toHaveCount(0);
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
