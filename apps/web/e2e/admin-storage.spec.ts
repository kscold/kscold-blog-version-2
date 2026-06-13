import { test, expect } from '@playwright/test';
import { success, mockShellApis, mockAdminDashboardApis } from './support/api';
import { seedAdminSession } from './support/auth';

const TINY_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);

const STORAGE_ROOT = {
  bucket: 'blog',
  currentPrefix: '',
  parentPrefix: null,
  folders: [{ name: 'images', key: 'images/' }],
  objects: [
    {
      name: 'hero.png',
      key: 'hero.png',
      size: 2048,
      lastModified: '2026-04-03T01:00:00.000Z',
      isImage: true,
      publicUrl: 'https://bucket.kscold.com/blog/hero.png',
    },
  ],
};

const STORAGE_IMAGES = {
  bucket: 'blog',
  currentPrefix: 'images/',
  parentPrefix: '',
  folders: [],
  objects: [
    {
      name: 'logo.png',
      key: 'images/logo.png',
      size: 4096,
      lastModified: '2026-04-03T02:00:00.000Z',
      isImage: true,
      publicUrl: 'https://bucket.kscold.com/blog/images/logo.png',
    },
  ],
};

test.describe('어드민 스토리지 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
    await mockAdminDashboardApis(page);
  });

  test('관리자는 대시보드 빠른 작업에서 스토리지 관리 페이지로 이동할 수 있다', async ({ page }) => {
    await seedAdminSession(page);
    await page.route('**/api/admin/storage**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          success({ bucket: 'blog', currentPrefix: '', parentPrefix: null, folders: [], objects: [] })
        ),
      });
    });

    await page.goto('/admin');

    const link = page.locator('[data-cy="admin-storage-link"]');
    await expect(link).toHaveAttribute('href', '/admin/storage');
    await link.click();
    await expect(page).toHaveURL(/\/admin\/storage/);
    await expect(page.locator('[data-cy="admin-storage-page"]')).toContainText('Storage');
  });

  test('관리자는 폴더 탐색과 폴더 생성, 파일 삭제 흐름을 확인할 수 있다', async ({ page }) => {
    await seedAdminSession(page);

    await page.route('**/api/admin/storage**', async route => {
      const req = route.request();
      const method = req.method();
      const url = new URL(req.url());
      const path = url.pathname;

      // 이미지 객체 미리보기 (image/png)
      if (method === 'GET' && path.endsWith('/storage/object')) {
        await route.fulfill({ status: 200, contentType: 'image/png', body: TINY_PNG });
        return;
      }
      // 폴더 생성 → banners 포함 응답
      if (method === 'POST' && path.endsWith('/storage/folders')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            success({
              ...STORAGE_ROOT,
              folders: [
                { name: 'images', key: 'images/' },
                { name: 'banners', key: 'banners/' },
              ],
            })
          ),
        });
        return;
      }
      // 객체 삭제 → objects 빈 응답
      if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(success({ ...STORAGE_ROOT, objects: [], deletedKeys: 1 })),
        });
        return;
      }
      // 목록 조회 (prefix 별)
      if (method === 'GET') {
        const prefix = url.searchParams.get('prefix') ?? '';
        const body = prefix === 'images/' ? STORAGE_IMAGES : STORAGE_ROOT;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(success(body)),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/admin/storage');

    await page.locator('[data-cy="admin-storage-folder-images"]').click();
    await expect(page.getByText('logo.png').first()).toBeVisible();

    await page.goto('/admin/storage');

    await page.locator('[data-cy="admin-storage-folder-input"]').fill('banners');
    await page.locator('[data-cy="admin-storage-folder-submit"]').click();
    await expect(page.getByText('banners').first()).toBeVisible();

    // 삭제 확인 dialog 자동 수락
    page.on('dialog', dialog => dialog.accept());
    await page.locator('[data-cy="admin-storage-delete-object-hero.png"]').click();
    await expect(page.getByText('현재 경로에 파일이 없습니다.')).toBeVisible();
  });
});
