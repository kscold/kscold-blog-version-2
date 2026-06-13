import { test, expect } from '@playwright/test';
import { success, mockApi } from './support/api';
import { seedAdminSession } from './support/auth';

test.describe('열람 요청 관리 시나리오', () => {
  test('관리자는 글 단위 또는 카테고리 단위로 승인 범위를 선택할 수 있다', async ({ page }) => {
    await seedAdminSession(page);

    await mockApi(
      page,
      'GET',
      '**/api/admin/access-requests',
      success([
        {
          id: 'req-1',
          userId: 'user-1',
          username: 'reader-one',
          postId: 'post-1',
          postTitle: '권한 모델 정리',
          postSlug: 'access-model',
          categoryId: 'cat-1',
          categoryName: '개발 이야기',
          status: 'PENDING',
          message: '이 글을 읽고 싶습니다.',
          createdAt: '2026-04-08T09:00:00Z',
        },
        {
          id: 'req-2',
          userId: 'user-2',
          username: 'reader-two',
          categoryId: 'cat-1',
          categoryName: '개발 이야기',
          status: 'PENDING',
          message: '예전 방식 요청입니다.',
          createdAt: '2026-04-08T10:00:00Z',
        },
      ])
    );

    await page.route('**/api/admin/access-requests/req-1/approve', async route => {
      expect(route.request().postDataJSON()).toEqual({ grantScope: 'CATEGORY' });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success({ id: 'req-1' })),
      });
    });

    await page.goto('/admin/access-requests');

    const req1 = page.locator('[data-cy="access-request-req-1"]');
    await expect(req1).toContainText('reader-one');
    await expect(req1).toContainText('권한 모델 정리');

    const scopeCategory = page.locator('[data-cy="access-request-req-1-scope-category"]');
    await scopeCategory.click();
    await expect(scopeCategory).toContainText('카테고리 전체 승인');
    await expect(scopeCategory).toContainText('같은 카테고리의 제한 글 전체를 열람할 수 있게');

    await page.locator('[data-cy="access-request-req-1-approve"]').click();

    await expect(req1).toHaveCount(0);
    await expect(page.locator('[data-cy="access-request-req-2-scope-post"]')).toBeDisabled();
  });
});
