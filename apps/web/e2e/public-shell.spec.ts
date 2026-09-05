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

    const firstTag = page.locator('a[href^="/blog/tags/"]').first();
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

  test('Feed SEO 메타데이터는 최초 head에 포함된다', async ({ page }) => {
    await page.goto('/feed');

    await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
      'content',
      /생각의 조각/
    );
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://kscold.com/feed'
    );
  });

  test('존재하지 않는 공개 콘텐츠 경로는 HTTP 404를 반환한다', async ({ request }) => {
    const missingRoutes = [
      '/feed/nonexistent-id',
      '/profile/definitely-not-a-real-user-xyz',
      '/blog/not-a-category/not-a-real-post-xyz',
      '/blog/not-a-real-category-xyz',
      '/blog/tags/not-a-real-tag-xyz',
      '/info/not-a-real-team-xyz',
      '/vault/not-a-real-note-xyz',
    ];

    const responses = await Promise.all(missingRoutes.map(route => request.get(route)));

    for (const response of responses) {
      expect(response.status()).toBe(404);
    }
  });

  test('이전 Feed 태그 쿼리는 통합 태그 경로로 영구 이동한다', async ({ page }) => {
    const response = await page.goto('/feed?tag=AI%20Agent');
    const redirectResponse = await response?.request().redirectedFrom()?.response();

    expect(redirectResponse?.status()).toBe(308);
    await expect(page).toHaveURL(/\/tags\/AI%20Agent$/);
  });

  test('사이트맵 정적 페이지는 canonical과 주 제목을 제공한다', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://kscold.com/privacy'
    );

    await page.goto('/vault');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'KSCOLD Vault 지식 그래프'
    );
  });

  test('사이트맵은 운영자 공개 프로필을 검색 경로로 제공한다', async ({ request }) => {
    const [response, robotsResponse] = await Promise.all([
      request.get('/sitemap.xml'),
      request.get('/robots.txt'),
    ]);
    const sitemap = await response.text();
    const lastModifiedValues = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
      match => match[1]
    );

    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('s-maxage=3600');
    expect(robotsResponse.status()).toBe(200);
    expect(robotsResponse.headers()['cache-control']).toContain('s-maxage=86400');
    expect(sitemap).toContain('<loc>https://kscold.com/profile/kscold</loc>');
    expect(sitemap).not.toContain('<loc>https://kscold.com/admin</loc>');
    expect(sitemap).not.toContain('<loc>https://kscold.com/login</loc>');
    expect(lastModifiedValues.length).toBeGreaterThan(0);
    for (const value of lastModifiedValues) {
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test('서버 렌더링 Footer는 일반 페이지에만 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText('Colding. All rights reserved.');

    await page.goto('/vault');
    await expect(page.locator('footer')).toHaveCount(0);
  });

  test('비로그인 상태에서는 헤더에 LOGIN 버튼이 노출된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-cy="header-auth-loading"]')).toHaveCount(0);
    const loginBtn = page.locator('[data-cy="header-login-btn"]');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toContainText('LOGIN');
  });

  test('모바일 사이드바 데이터는 메뉴를 열 때 불러온다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let sidebarApiCalls = 0;
    await page.route(/\/api\/(?:categories|tags\/index)$/, async route => {
      sidebarApiCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success([])),
      });
    });

    await page.goto('/login');
    await page.waitForTimeout(300);
    expect(sidebarApiCalls).toBe(0);

    await page.locator('[data-cy="sidebar-toggle"]').click();
    await expect.poll(() => sidebarApiCalls).toBe(2);
  });

  test('사이드바는 블로그 태그와 피드 전용 태그를 알맞은 경로로 연결한다', async ({ page }) => {
    await mockApi(
      page,
      'GET',
      '**/api/tags/index',
      success([
        {
          id: 'tag-1',
          name: 'AI Agent',
          slug: 'ai-agent',
          categoryId: null,
          categoryName: 'AI',
          postCount: 3,
          feedCount: 2,
          totalCount: 5,
          unregistered: false,
        },
        {
          id: null,
          name: '오늘기록',
          slug: null,
          categoryId: null,
          categoryName: null,
          postCount: 0,
          feedCount: 2,
          totalCount: 2,
          unregistered: true,
        },
      ])
    );

    await page.goto('/login');

    await expect(page.locator('a[href="/blog/tags/ai-agent"]')).toBeVisible();
    await expect(page.locator('a[href="/tags/%EC%98%A4%EB%8A%98%EA%B8%B0%EB%A1%9D"]')).toBeVisible();
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
