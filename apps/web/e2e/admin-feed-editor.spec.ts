import { test, expect } from '@playwright/test';
import { success, mockApi, mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';
import { expectNoHorizontalOverflow, VIEWPORTS } from './support/dom';

const LINK_PREVIEW = success({
  url: 'https://kscold.com/info/team',
  title: 'Colding 소개',
  description: '브랜드와 프로젝트 방향을 소개하는 안내 페이지입니다.',
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  siteName: 'KSCOLD',
});

test.describe('피드 에디터 반응형 시나리오', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.label} 해상도에서도 피드 작성 흐름이 편하게 이어진다`, async ({ page }) => {
      await mockShellApis(page);
      await mockApi(page, 'GET', '**/api/link-preview*', LINK_PREVIEW);
      await seedAdminSession(page);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/admin/feed/new');
      await page.reload();

      await expect(page.locator('[data-cy="feed-editor-surface"]')).toBeVisible();
      const content = page.locator('[data-cy="feed-editor-content"]');
      const submitButton = page.locator('[data-cy="feed-editor-submit"]');
      await expect(content).toBeVisible();
      await expect(content).toHaveAttribute('maxlength', '10000');
      await expect(async () => {
        await content.fill('노션형 피드 작성기 흐름 점검');
        await expect(submitButton).toBeEnabled();
      }).toPass();
      await expect(page.locator('[data-cy="feed-editor-images"]')).toBeVisible();

      const linkInput = page.locator('[data-cy="feed-editor-link-input"]');
      await expect(linkInput).toBeVisible();
      await expect(linkInput).toHaveAttribute('maxlength', '2048');
      await linkInput.fill('httpx://kscold.com/info/team');
      await expect(page.locator('[data-cy="feed-editor-link-error"]')).toContainText(
        'http 또는 https'
      );
      await expect(submitButton).toBeDisabled();
      await linkInput.fill('https://kscold.com/info/team');
      await expect(page.getByText('Colding 소개')).toBeVisible();

      await expect(page.locator('[data-cy="feed-editor-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-cy="feed-editor-upload"]')).toBeAttached();
      await expect(page.locator('[data-cy="feed-editor-visibility"]')).toBeVisible();
      await expect(submitButton).toBeAttached();

      await expectNoHorizontalOverflow(page, viewport.width);
    });
  }

  test('기존 링크를 비우면 수정 요청에 빈 문자열을 명시한다', async ({ page }) => {
    let updateBody: Record<string, unknown> | undefined;
    const feed = {
      id: 'feed-edit',
      content: '기존 피드 본문',
      images: [],
      author: { id: 'admin-1', name: '김승찬' },
      visibility: 'PUBLIC' as const,
      linkPreview: LINK_PREVIEW.data,
      likesCount: 0,
      commentsCount: 0,
      views: 0,
      isLiked: false,
      createdAt: '2026-09-06T00:00:00',
      updatedAt: '2026-09-06T00:00:00',
    };
    await mockShellApis(page);
    await seedAdminSession(page);
    await mockApi(page, 'GET', '**/api/feeds/feed-edit', success(feed));
    await mockApi(page, 'GET', '**/api/feeds/admin*', success({ content: [], totalPages: 0 }));
    await page.route('**/api/feeds/feed-edit', async route => {
      if (route.request().method() !== 'PUT') {
        await route.fallback();
        return;
      }
      updateBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(feed)),
      });
    });

    await page.goto('/admin/feed/feed-edit/edit');
    const linkInput = page.locator('[data-cy="feed-editor-link-input"]');
    await expect(linkInput).toHaveValue('https://kscold.com/info/team');
    await linkInput.fill('');
    await page.locator('[data-cy="feed-editor-submit"]').click();

    await expect.poll(() => updateBody?.linkUrl).toBe('');
  });
});
