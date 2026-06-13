import { test, expect, type Page } from '@playwright/test';
import { success, mockApi, mockShellApis } from './support/api';
import { seedSession } from './support/auth';
import { setRangeValue } from './support/dom';

interface AdminNightRequest {
  id: string;
  userId: string;
  requesterName: string;
  requesterEmail: string;
  taskTitle: string;
  message: string;
  participationMode: string;
  status: string;
  reviewNote?: string | null;
  preferredSlot: Record<string, unknown> | null;
  scheduledSlot: Record<string, unknown> | null;
  createdAt: string;
}

const USER = {
  id: 'user-1',
  email: 'nightowl@example.com',
  username: 'nightowl',
  displayName: '류태호',
  role: 'USER' as const,
};

test.describe('Admin Night 신청 시나리오', () => {
  test('로그인 사용자는 신청 PR을 보내고 내 신청 흐름에서 상태를 확인할 수 있다', async ({ page }) => {
    await mockShellApis(page);
    await seedSession(page, USER);

    let myRequests: AdminNightRequest[] = [
      {
        id: 'request-1',
        userId: 'user-1',
        requesterName: '류태호',
        requesterEmail: 'nightowl@example.com',
        taskTitle: '메일 답장 정리',
        message: '밀린 메일과 체크리스트를 털어내고 싶어요.',
        participationMode: 'FLEXIBLE',
        status: 'APPROVED',
        preferredSlot: {
          slotKey: '2026-04-14|Inbox Sweep',
          date: '2026-04-14',
          weekday: '월',
          timeLabel: '20:30 - 22:00',
          focus: 'Inbox Sweep',
          badgeLabel: 'Open',
        },
        scheduledSlot: {
          slotKey: '2026-04-15|Body Doubling',
          date: '2026-04-15',
          weekday: '화',
          timeLabel: '21:00 - 22:40',
          focus: 'Body Doubling',
          badgeLabel: 'Tonight',
        },
        createdAt: '2026-04-14T12:00:00',
      },
    ];

    await mockApi(page, 'GET', '**/api/admin-night/calendar*', success([]));
    await page.route('**/api/admin-night/requests**', async route => {
      const req = route.request();
      const method = req.method();
      const url = req.url();

      if (method === 'GET' && url.includes('/requests/me')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(success(myRequests)),
        });
        return;
      }
      if (method === 'POST') {
        const body = req.postDataJSON();
        expect(body.taskTitle).toContain('작은 버그 수정');
        expect(body.requesterName).toBe('류태호');
        expect(body.participationMode).toBe('OFFLINE');
        expect(body.preferredSlot.timeLabel).toBe('19:00 - 22:00');
        const created: AdminNightRequest = {
          id: 'request-2',
          userId: 'user-1',
          requesterName: '류태호',
          requesterEmail: 'nightowl@example.com',
          taskTitle: body.taskTitle,
          message: body.message,
          participationMode: body.participationMode,
          status: 'PENDING',
          preferredSlot: body.preferredSlot,
          scheduledSlot: null,
          createdAt: '2026-04-14T13:00:00',
        };
        myRequests = [created, ...myRequests];
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(success(created)),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/admin-night');

    await page.locator('[data-cy="admin-night-request-name"]').fill('류태호');
    await page.locator('[data-cy="admin-night-request-title"]').fill('작은 버그 수정과 블로그 초안 정리');
    await page.locator('[data-cy="admin-night-mode-offline"]').click();
    await setRangeValue(page, '[data-cy="admin-night-range-end"]', '1320');
    await expect(page.locator('[data-cy="admin-night-range-summary"]')).toContainText('19:00 - 22:00');
    await page
      .locator('[data-cy="admin-night-request-message"]')
      .fill('퇴근 후 몰입해서 문서와 작은 버그를 같이 정리하고 싶어요.');
    await page.locator('[data-cy="admin-night-request-submit"]').click();

    await expect(page.getByText('신청 PR을 보냈습니다')).toBeVisible();
    await expect(page.getByText('작은 버그 수정과 블로그 초안 정리')).toBeVisible();
    await expect(page.getByText('대기 중')).toBeVisible();
    await expect(page.getByText('오프라인').first()).toBeVisible();
  });

  test('추가 정보 요청된 신청은 보완해서 다시 보낼 수 있다', async ({ page }) => {
    await mockShellApis(page);
    await seedSession(page, USER);

    let myRequests: AdminNightRequest[] = [
      {
        id: 'request-2',
        userId: 'user-1',
        requesterName: '류태호',
        requesterEmail: 'nightowl@example.com',
        taskTitle: '초안 정리',
        message: '초안만 간단히 정리하고 싶어요.',
        participationMode: 'FLEXIBLE',
        status: 'INFO_REQUESTED',
        reviewNote: '실명 확인이 어려워서, 어떤 자리에서 같이 보고 싶은지 조금 더 적어 주세요.',
        preferredSlot: {
          slotKey: '2026-04-15|Body Doubling',
          date: '2026-04-15',
          weekday: '화',
          timeLabel: '21:00 - 22:40',
          focus: 'Body Doubling',
          badgeLabel: 'Tonight',
        },
        scheduledSlot: null,
        createdAt: '2026-04-14T13:00:00',
      },
    ];

    await mockApi(page, 'GET', '**/api/admin-night/calendar*', success([]));
    await page.route('**/api/admin-night/requests**', async route => {
      const req = route.request();
      const method = req.method();
      const url = req.url();

      if (method === 'GET' && url.includes('/requests/me')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(success(myRequests)),
        });
        return;
      }
      if (method === 'PUT' && url.includes('/resubmit')) {
        const body = req.postDataJSON();
        expect(body.requesterName).toBe('류태호');
        expect(body.participationMode).toBe('OFFLINE');
        expect(body.taskTitle).toContain('실명과 일정');
        expect(body.preferredSlot.timeLabel).toBe('19:00 - 22:00');
        const updated: AdminNightRequest = {
          id: 'request-2',
          userId: 'user-1',
          requesterName: body.requesterName,
          requesterEmail: 'nightowl@example.com',
          taskTitle: body.taskTitle,
          message: body.message,
          participationMode: body.participationMode,
          status: 'PENDING',
          reviewNote: null,
          preferredSlot: body.preferredSlot,
          scheduledSlot: null,
          createdAt: '2026-04-14T13:00:00',
        };
        myRequests = [updated];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(success(updated)),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/admin-night');

    await expect(page.getByText('추가 정보 요청됨')).toBeVisible();
    await expect(page.getByText('실명 확인이 어려워서')).toBeVisible();
    await page.locator('[data-cy="admin-night-resubmit-start-request-2"]').click();
    await page.locator('[data-cy="admin-night-request-title"]').fill('실명과 일정 맥락을 보완한 신청');
    await page.locator('[data-cy="admin-night-mode-offline"]').click();
    await setRangeValue(page, '[data-cy="admin-night-range-end"]', '1320');
    await expect(page.locator('[data-cy="admin-night-range-summary"]')).toContainText('19:00 - 22:00');
    await page
      .locator('[data-cy="admin-night-request-message"]')
      .fill('오프라인으로 만나서 블로그 초안과 밀린 메일을 같이 끝내고 싶어요.');
    await page.locator('[data-cy="admin-night-request-submit"]').click();

    await expect(page.getByText('보완한 신청을 다시 보냈습니다')).toBeVisible();
    await expect(page.getByText('실명과 일정 맥락을 보완한 신청')).toBeVisible();
    await expect(page.getByText('대기 중')).toBeVisible();
    await expect(page.getByText('오프라인').first()).toBeVisible();
  });
});
