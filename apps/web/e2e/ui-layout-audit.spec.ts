import { test, expect, type Page } from '@playwright/test';
import { success, mockApi, mockShellApis, mockAdminDashboardApis } from './support/api';
import { seedAdminSession, clearAuthCookie } from './support/auth';

async function mockAuditApis(page: Page) {
  await mockApi(
    page,
    'GET',
    '**/api/categories',
    success([
      {
        id: 'cat-1',
        name: 'Dev Story',
        slug: 'dev-story',
        description: '개발 경험과 회고',
        parent: null,
        icon: '✦',
        color: '#111827',
        order: 0,
        depth: 0,
        postCount: 12,
      },
    ])
  );
  await mockApi(page, 'GET', '**/api/tags', success([]));
  await mockApi(page, 'GET', '**/api/feeds/tags', success([]));
  await mockAdminDashboardApis(page);

  await mockApi(page, 'GET', '**/api/admin/users/stats', {
    totalUsers: 124,
    newUsersToday: 3,
    newUsersThisWeek: 11,
    newUsersThisMonth: 24,
    dailySignups: [],
    recentUsers: [],
  });
  await mockApi(
    page,
    'GET',
    '**/api/admin/access-requests',
    success([
      {
        id: 'req-1',
        userId: 'user-2',
        username: 'reader-one',
        postId: 'post-1',
        postTitle: '권한 모델',
        postSlug: 'access-model',
        categoryId: 'cat-1',
        categoryName: 'Dev Story',
        status: 'PENDING',
        grantScope: 'POST',
        message: '접근 권한을 확인하고 싶습니다.',
        createdAt: '2026-04-08T08:20:00Z',
      },
    ])
  );
  await mockApi(
    page,
    'GET',
    '**/api/guestbook*',
    success({
      content: [
        {
          id: 'entry-1',
          authorName: '기존 방문자',
          isAdmin: false,
          canDelete: false,
          content: '반가웠어요. 다음 글도 기대할게요.',
          createdAt: '2026-04-08T09:00:00Z',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 12,
      number: 0,
      first: true,
      last: true,
      empty: false,
    })
  );
}

async function expectNoOverflow(page: Page, width: number) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(width);
}

const SHOT_DIR = 'test-results/screenshots';

test.describe('UI 레이아웃 캡처 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
    await mockAuditApis(page);
  });

  test('모바일 해상도에서 주요 화면의 버튼과 문구가 자연스럽게 보인다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedAdminSession(page);

    await page.goto('/admin/testing');
    await expectNoOverflow(page, 390);
    await page.screenshot({ path: `${SHOT_DIR}/layout-audit-admin-mobile.png` });

    await page.goto('/admin/access-requests');
    await expectNoOverflow(page, 390);
    await page.screenshot({ path: `${SHOT_DIR}/layout-audit-access-requests-mobile.png` });

    await page.goto('/guestbook');
    await expectNoOverflow(page, 390);
    await page.screenshot({ path: `${SHOT_DIR}/layout-audit-guestbook-mobile.png` });

    // 로그아웃 상태로 전환: 쿠키 제거 + (다음 goto 시) localStorage 비우기
    await clearAuthCookie(page);
    await page.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* noop */
      }
    });
    await page.goto('/login?redirect=%2Fguestbook');
    // 비로그인 login 폼 진입 확인 (문구 대신 안정적인 폼 요소로)
    await expect(page.locator('[data-cy="login-submit"]')).toBeVisible();
    await expectNoOverflow(page, 390);
    await page.screenshot({ path: `${SHOT_DIR}/layout-audit-login-mobile.png` });
  });

  test('데스크톱 해상도에서 관리자 카드와 설명 문구가 정렬된다', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedAdminSession(page);

    await page.goto('/admin/testing');
    await expectNoOverflow(page, 1440);
    await page.screenshot({ path: `${SHOT_DIR}/layout-audit-admin-desktop.png` });

    await page.goto('/admin/access-requests');
    await expectNoOverflow(page, 1440);
    await page.screenshot({ path: `${SHOT_DIR}/layout-audit-access-requests-desktop.png` });
  });
});
