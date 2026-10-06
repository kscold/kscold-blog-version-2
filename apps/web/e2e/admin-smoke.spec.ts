import { test, expect, type Page } from '@playwright/test';
import { success, isolateBackendApi, mockApi, mockShellApis } from './support/api';
import {
  accessRequests,
  categories,
  chatRooms,
  dailyVisits,
  postPage,
  tags,
  topPaths,
  userStats,
  vaultPage,
  visitHistory,
} from './support/adminSmokeFixtures';
import { seedAdminSession } from './support/auth';

// 어드민의 QA 화면에서 실행하면 러너가 세션별 폴더를 넘겨준다. 로컬과 CI에서는 기본 위치에 남긴다.
const SHOT_DIR = process.env.QA_SCREENSHOT_DIR || 'test-results/screenshots';

/** 둘러볼 화면들이 부르는 API를 준비한 응답으로 채운다. 준비하지 않은 요청은 백엔드에 닿기 전에 막힌다. */
async function mockAdminApis(page: Page) {
  await isolateBackendApi(page);
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/categories', success(categories));
  await mockApi(page, 'GET', '**/api/tags', success(tags));
  await mockApi(page, 'GET', '**/api/posts/admin*', success(postPage));
  await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success({ ...postPage, size: 1 }));
  await mockApi(page, 'GET', '**/api/feeds/admin*', success({ ...postPage, size: 20 }));
  await mockApi(page, 'GET', '**/api/vault/notes*', success(vaultPage));
  await mockApi(page, 'GET', '**/api/admin/chat/rooms', success(chatRooms));
  await mockApi(page, 'GET', '**/api/admin/users/stats', userStats);
  await mockApi(page, 'GET', '**/api/admin/access-requests', success(accessRequests));
  await mockApi(page, 'GET', '**/api/admin/admin-night/requests*', success([]));
  await mockApi(page, 'GET', '**/api/admin/stack-share/settlements', success([]));
  await mockApi(page, 'GET', '**/api/admin/analytics/daily-visits*', success(dailyVisits));
  await mockApi(page, 'GET', '**/api/admin/analytics/top-paths*', success(topPaths));
  await mockApi(page, 'GET', '**/api/admin/analytics/visit-history*', success(visitHistory));
  // QA 화면이 조회하는 실행 상태도 고정해, 이 테스트를 띄운 실행 자체가 화면에 섞이지 않게 한다.
  await mockApi(page, 'GET', '**/admin/testing/session', { session: null });
}

/** 한 화면을 열어 확인하고, 그 순간의 모습을 실행 결과에 남긴다. */
async function capture(page: Page, fileName: string, title: string, visit: () => Promise<void>) {
  await test.step(title, async () => {
    await visit();
    await page.screenshot({ path: `${SHOT_DIR}/${fileName}.png` });
  });
}

test.describe('어드민 라이브 스모크', () => {
  test('대시보드와 주요 페이지가 순차적으로 표시된다', async ({ page }) => {
    // 여섯 경로를 처음 컴파일하고 캡처하는 시나리오라 전체 병렬 실행의 30초 한도를 넘을 수 있다.
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockAdminApis(page);
    await seedAdminSession(page);

    await capture(page, '01-dashboard', '01 대시보드', async () => {
      await page.goto('/admin');
      await expect(page.getByText('Dashboard').first()).toBeVisible();
      // 처리할 일 집계가 끝난 화면을 남기려고, 준비한 열람 요청 한 건이 반영될 때까지 기다린다.
      await expect(
        page.getByRole('region', { name: '확인이 필요한 일' }).getByText('1건')
      ).toBeVisible();
    });

    await capture(page, '02-posts', '02 포스트 관리', async () => {
      await page.goto('/admin/posts');
      await expect(page.getByRole('heading', { name: '포스트 관리' })).toBeVisible();
    });

    await capture(page, '03-categories', '03 카테고리 관리', async () => {
      await page.goto('/admin/categories');
      await expect(page.getByText('카테고리').first()).toBeVisible();
    });

    await capture(page, '04-chat', '04 채팅 관리', async () => {
      await page.goto('/admin/chat');
      await expect(page.getByText('방문자 채팅')).toHaveCount(1);
      await expect(page.getByText('방문자 채팅')).toBeVisible();
    });

    await capture(page, '05-testing', '05 QA / E2E', async () => {
      await page.goto('/admin/testing');
      await expect(page.getByRole('heading', { name: 'QA / E2E' })).toBeVisible();
    });

    await capture(page, '06-access-requests', '06 열람 요청 관리', async () => {
      await page.goto('/admin/access-requests');
      await expect(page).toHaveURL(/\/admin\/access-requests/);
      await expect(page.getByText('reader-one')).toBeVisible();
      await expect(page.getByText('승인').first()).toBeVisible();
    });
  });
});
