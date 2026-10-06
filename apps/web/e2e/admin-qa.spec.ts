import { test, expect, type Page } from '@playwright/test';
import { success, emptyPage, mockApi, mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';

const SESSION_ROUTE = '**/admin/testing/session';
const TRANSPARENT_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);

const runningSession = {
  id: 'admin_smoke-1775204117576-f1f739f6',
  suiteId: 'admin_smoke',
  suiteLabel: '어드민 UI 테스트 실행',
  status: 'running',
  startedAt: '2026-04-03T08:15:00Z',
  endedAt: null,
  exitCode: null,
  logs: ['17:15:00 실행 시작 · 어드민 UI 테스트 실행 (https://kscold.com)'],
  screenshots: [],
  latestScreenshotUrl: null,
};

const completedSession = {
  ...runningSession,
  status: 'completed',
  endedAt: '2026-04-03T08:15:04Z',
  exitCode: 0,
  logs: [
    ...runningSession.logs,
    '17:15:01 통과 · 01 대시보드 (0.4초)',
    '17:15:04 실행 완료 · 통과',
  ],
  screenshots: [
    {
      name: '01-dashboard.png',
      url: '/admin/testing/artifacts/admin_smoke-1775204117576-f1f739f6/screenshots/01-dashboard.png',
    },
  ],
  latestScreenshotUrl:
    '/admin/testing/artifacts/admin_smoke-1775204117576-f1f739f6/screenshots/01-dashboard.png',
};

async function mockAdminDashboardApis(page: Page) {
  await mockApi(page, 'GET', '**/api/posts/admin*', success(emptyPage(5)));
  await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage(1)));
  await mockApi(page, 'GET', '**/api/vault/notes*', success(emptyPage(1)));
  await mockApi(page, 'GET', '**/api/admin/chat/rooms', success([]));
}

test.describe('어드민 QA 진입 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
    await mockAdminDashboardApis(page);
    // 러너가 떠 있는 환경과 없는 환경에서 같은 화면이 나오도록 실행 상태를 고정한다.
    await mockApi(page, 'GET', SESSION_ROUTE, { session: null });
  });

  test('관리자는 대시보드 빠른 작업에서 QA / E2E 페이지로 이동할 수 있다', async ({ page }) => {
    await seedAdminSession(page);

    await page.goto('/admin');

    const qaLink = page.locator('[data-testid="admin-qa-link"]:visible');
    await expect(qaLink).toHaveCount(1);
    await expect(qaLink).toHaveAttribute('href', '/admin/testing');
    await qaLink.click();

    await expect(page).toHaveURL(/\/admin\/testing/);
    await expect(page.locator('[data-testid="admin-qa-page"]')).toContainText('QA / E2E');
  });

  test('관리자는 QA / E2E 페이지에서 주요 시나리오 링크와 실행 명령을 확인할 수 있다', async ({
    page,
  }) => {
    await seedAdminSession(page);

    await page.goto('/admin/testing');

    // 스트리밍 중에는 서버가 보낸 숨은 사본이 잠깐 함께 남으므로, 실제로 보이는 요소만 검사한다.
    await expect(page.locator('[data-testid="admin-qa-page"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="admin-qa-scenario-home"]:visible')).toHaveAttribute(
      'href',
      '/'
    );
    await expect(page.locator('[data-testid="admin-qa-scenario-guestbook"]:visible')).toHaveAttribute(
      'href',
      '/guestbook'
    );
    await expect(page.locator('[data-testid="admin-qa-scenario-admin-chat"]:visible')).toHaveAttribute(
      'href',
      '/admin/chat'
    );
    await expect(page.locator('[data-testid="admin-qa-command-run"]:visible')).toContainText(
      'pnpm --dir apps/web test:e2e'
    );
    await expect(page.locator('[data-testid="admin-qa-command-open"]:visible')).toContainText(
      'pnpm --dir apps/web'
    );
    await expect(page.locator('[data-testid="admin-qa-command-runner"]:visible')).toContainText(
      'install-qa-runner.sh'
    );
  });

  test('테스트 실행을 누르면 세션이 시작되고 끝난 뒤 로그와 스크린샷이 표시된다', async ({
    page,
  }) => {
    let current: typeof runningSession | null = null;
    let startBody: unknown = null;
    await page.route(SESSION_ROUTE, async route => {
      if (route.request().method() === 'POST') {
        startBody = route.request().postDataJSON();
        current = runningSession;
        await route.fulfill({ status: 201, json: { session: current } });
        return;
      }
      await route.fulfill({ status: 200, json: { session: current } });
    });
    await page.route('**/admin/testing/artifacts/**', route =>
      route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG })
    );
    await seedAdminSession(page);
    await page.goto('/admin/testing');

    // "실행 중"은 "실행 중지" 버튼 글자에도 들어 있어, 상태는 문구 검색이 아니라 배지를 직접 본다.
    const status = page.locator('[data-testid="admin-qa-status"]');
    const runButton = page.locator('[data-testid="admin-qa-run-button"]');
    await expect(status).toHaveText('대기 중');
    await expect(runButton).toBeEnabled();
    // 버튼 글자가 좁은 칸에서 세로로 줄바꿈되던 문제를 막는다. 한 줄 높이를 넘으면 안 된다.
    expect((await runButton.boundingBox())?.height).toBeLessThan(44);
    await runButton.click();

    await expect(status).toHaveText('실행 중');
    expect(startBody).toEqual({ suiteId: 'admin_smoke' });
    await expect(runButton).toBeDisabled();
    await expect(page.locator('[data-testid="admin-qa-stop-button"]')).toBeEnabled();

    current = completedSession;
    await expect(status).toHaveText('통과');
    await expect(page.locator('[data-testid="admin-qa-log-panel"]')).toContainText(
      '통과 · 01 대시보드'
    );
    await expect(page.getByText('1 captured')).toBeVisible();
    await expect(page.getByText('01 대시보드', { exact: true })).toBeVisible();
    await expect(page.locator('[data-testid="admin-qa-delete-button"]')).toBeEnabled();
  });

  test('러너에 연결되지 않으면 이유를 안내하고 실행 결과는 비워 둔다', async ({ page }) => {
    await page.route(SESSION_ROUTE, route =>
      route.fulfill({
        status: 503,
        json: {
          message: 'QA 러너에 연결하지 못했습니다. 호스트에서 러너가 실행 중인지 확인해 주세요.',
          session: null,
        },
      })
    );
    await seedAdminSession(page);
    await page.goto('/admin/testing');

    await expect(page.getByText('QA 러너에 연결하지 못했습니다.', { exact: false })).toBeVisible();
    await expect(page.locator('[data-testid="admin-qa-status"]')).toHaveText('대기 중');
    await expect(page.locator('[data-testid="admin-qa-delete-button"]')).toBeDisabled();
  });
});
