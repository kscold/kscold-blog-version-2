import { test, expect } from '@playwright/test';
import { success, mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';
import {
  buildUpcomingAdminNightSlots,
  getAdminNightDateKey,
} from '../src/widgets/admin-night/lib/adminNight';

function buildTodaySlot() {
  const slot = buildUpcomingAdminNightSlots(getAdminNightDateKey(new Date()), 1)[0];

  return {
    slotKey: slot.slotKey,
    date: slot.date,
    weekday: slot.weekday,
    timeLabel: slot.timeLabel,
    focus: slot.focus,
    badgeLabel: slot.badgeLabel,
  };
}

test.describe('Admin Night 관리자 승인 시나리오', () => {
  test('관리자는 신청 PR을 승인해 일정으로 merge 할 수 있다', async ({ page }) => {
    await mockShellApis(page);
    await seedAdminSession(page);
    const slot = buildTodaySlot();

    const pending = [
      {
        id: 'request-1',
        userId: 'user-1',
        requesterName: '류태호',
        requesterEmail: 'nightowl@example.com',
        taskTitle: '문서 정리와 메일 답장',
        message: '퇴근 후 밀린 문서를 정리하고 싶어요.',
        participationMode: 'OFFLINE',
        status: 'PENDING',
        preferredSlot: { ...slot },
        scheduledSlot: null,
        createdAt: '2026-04-14T12:00:00',
      },
    ];
    // status 쿼리에 따라 분기: PENDING 만 데이터, 나머지는 빈 배열
    await page.route('**/api/admin/admin-night/requests?**', async route => {
      if (route.request().method() !== 'GET') return route.fallback();
      const status = new URL(route.request().url()).searchParams.get('status');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(status === 'PENDING' ? pending : [])),
      });
    });

    await page.route('**/api/admin/admin-night/requests/request-1/approve', async route => {
      const body = route.request().postDataJSON();
      expect(body.scheduledSlot.focus).toBeTruthy();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          success({
            id: 'request-1',
            userId: 'user-1',
            requesterName: '류태호',
            requesterEmail: 'nightowl@example.com',
            taskTitle: '문서 정리와 메일 답장',
            message: '퇴근 후 밀린 문서를 정리하고 싶어요.',
            participationMode: 'OFFLINE',
            status: 'APPROVED',
            preferredSlot: { ...slot },
            scheduledSlot: body.scheduledSlot,
            createdAt: '2026-04-14T12:00:00',
          })
        ),
      });
    });

    await page.goto('/admin/admin-night');
    await expect(page.getByText('문서 정리와 메일 답장')).toBeVisible();
    await expect(page.getByText('진행 방식: 오프라인', { exact: true })).toBeVisible();

    const approvePromise = page.waitForResponse('**/api/admin/admin-night/requests/request-1/approve');
    await page.locator('[data-cy="admin-night-approve-request-1"]').click();
    await approvePromise;
  });

  test('관리자는 실명 확인이 어려운 신청에 추가 정보를 요청할 수 있다', async ({ page }) => {
    await mockShellApis(page);
    await seedAdminSession(page);
    const slot = buildTodaySlot();

    const pending = [
      {
        id: 'request-2',
        userId: 'user-2',
        requesterName: '류태호',
        requesterEmail: 'nightowl@example.com',
        taskTitle: '같이 끝내고 싶은 일 정리',
        message: '퇴근 후 밀린 일을 정리하고 싶어요.',
        participationMode: 'FLEXIBLE',
        status: 'PENDING',
        preferredSlot: { ...slot },
        scheduledSlot: null,
        createdAt: '2026-04-14T12:00:00',
      },
    ];
    await page.route('**/api/admin/admin-night/requests?**', async route => {
      if (route.request().method() !== 'GET') return route.fallback();
      const status = new URL(route.request().url()).searchParams.get('status');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(status === 'PENDING' ? pending : [])),
      });
    });

    await page.route('**/api/admin/admin-night/requests/request-2/request-info', async route => {
      const body = route.request().postDataJSON();
      expect(body.reviewNote).toContain('실명');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          success({
            id: 'request-2',
            status: 'INFO_REQUESTED',
            reviewNote: body.reviewNote,
            preferredSlot: { ...slot },
            scheduledSlot: null,
            createdAt: '2026-04-14T12:00:00',
          })
        ),
      });
    });

    await page.goto('/admin/admin-night');
    await page
      .locator('[data-cy="admin-night-review-note-request-2"]')
      .fill('실명 확인이 어려워서, 자기소개 링크나 함께 보고 싶은 맥락을 조금 더 남겨주세요.');

    const infoPromise = page.waitForResponse(
      '**/api/admin/admin-night/requests/request-2/request-info'
    );
    await page.locator('[data-cy="admin-night-request-info-request-2"]').click();
    await infoPromise;
  });
});
