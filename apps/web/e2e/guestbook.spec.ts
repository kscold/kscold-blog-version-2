import { test, expect, type Page } from '@playwright/test';
import { success, mockShellApis } from './support/api';

interface GuestbookEntry {
  id: string;
  authorName: string;
  isAdmin: boolean;
  canDelete: boolean;
  content: string;
  createdAt: string;
}

function pageOf(entries: GuestbookEntry[], page = 0, size = 12) {
  return {
    content: entries.slice(page * size, page * size + size),
    totalElements: entries.length,
    totalPages: Math.max(1, Math.ceil(entries.length / size)),
    size,
    number: page,
    first: page === 0,
    last: page >= Math.ceil(entries.length / size) - 1,
    empty: entries.length === 0,
  };
}

/** 로그인 사용자 시드 (auth/me 목 + localStorage 토큰) */
async function seedUser(page: Page, role: 'USER' | 'ADMIN', id: string) {
  await mockShellApis(page);
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        success({
          id,
          email: 'developerkscold@gmail.com',
          username: 'kscold',
          displayName: '김승찬',
          role,
        })
      ),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('accessToken', 'fake-access-token');
    window.localStorage.setItem('refreshToken', 'fake-refresh-token');
  });
}

test.describe('방명록 사용자 시나리오', () => {
  test('비로그인 방문자는 방명록에서 안내를 보고 로그인 페이지로 이동할 수 있다', async ({ page }) => {
    await mockShellApis(page);
    await page.route('**/api/guestbook?page=0&size=12', async route => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(pageOf([]))),
      });
    });

    await page.goto('/guestbook');

    const cta = page.locator('[data-cy="guestbook-login-cta"]');
    await expect(cta).toContainText('로그인하고 남기기');
    await cta.click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fguestbook/);
  });

  test('로그인 사용자는 방명록을 남기고 자신이 남긴 글을 직접 삭제할 수 있다', async ({ page }) => {
    let entries: GuestbookEntry[] = [
      {
        id: 'entry-1',
        authorName: '기존 방문자',
        isAdmin: false,
        canDelete: false,
        content: '먼저 남긴 인사입니다.',
        createdAt: '2026-04-02T09:00:00',
      },
    ];

    await seedUser(page, 'USER', 'user-1');

    // 상태 있는 목: GET 은 현재 entries, POST 는 추가, DELETE 는 제거
    await page.route('**/api/guestbook**', async route => {
      const req = route.request();
      const method = req.method();
      const url = req.url();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(success(pageOf(entries))),
        });
        return;
      }
      if (method === 'POST') {
        const body = req.postDataJSON();
        const newEntry: GuestbookEntry = {
          id: 'entry-2',
          authorName: '김승찬',
          isAdmin: false,
          canDelete: true,
          content: body.content,
          createdAt: '2026-04-02T10:00:00',
        };
        entries = [newEntry, ...entries];
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(success(newEntry, '방명록이 작성되었습니다')),
        });
        return;
      }
      if (method === 'DELETE') {
        const entryId = url.split('/').pop();
        entries = entries.filter(entry => entry.id !== entryId);
        await route.fulfill({ status: 204, body: '' });
        return;
      }
      await route.fallback();
    });

    await page.goto('/guestbook');

    await page.locator('[data-cy="guestbook-textarea"]').fill('방명록 시나리오 테스트입니다.');
    await page.locator('[data-cy="guestbook-submit"]').click();

    const entryList = page.locator('[data-cy="guestbook-entry"]');
    await expect(entryList.first()).toContainText('방명록 시나리오 테스트입니다.');

    await entryList.first().locator('[data-cy="guestbook-delete"]').click();

    await expect(entryList).toHaveCount(1);
    await expect(entryList.first()).toContainText('먼저 남긴 인사입니다.');
  });

  test('삭제 권한이 없는 방명록에는 삭제 버튼이 보이지 않는다', async ({ page }) => {
    const entries: GuestbookEntry[] = [
      {
        id: 'entry-1',
        authorName: '방문자 A',
        isAdmin: false,
        canDelete: false,
        content: '삭제 권한이 없는 글입니다.',
        createdAt: '2026-04-02T09:00:00',
      },
      {
        id: 'entry-2',
        authorName: '관리자',
        isAdmin: true,
        canDelete: true,
        content: '관리자는 직접 정리할 수 있습니다.',
        createdAt: '2026-04-02T10:00:00',
      },
    ];

    await seedUser(page, 'ADMIN', 'admin-1');
    await page.route('**/api/guestbook?page=0&size=12', async route => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(pageOf(entries))),
      });
    });

    await page.goto('/guestbook');

    const entryList = page.locator('[data-cy="guestbook-entry"]');
    await expect(entryList.nth(0).locator('[data-cy="guestbook-delete"]')).toHaveCount(0);
    await expect(entryList.nth(1).locator('[data-cy="guestbook-delete"]')).toHaveCount(1);
  });
});
