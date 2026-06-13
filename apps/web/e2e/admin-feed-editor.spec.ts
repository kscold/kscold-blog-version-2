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

      await expect(page.locator('[data-cy="feed-editor-surface"]')).toBeVisible();
      const content = page.locator('[data-cy="feed-editor-content"]');
      await expect(content).toBeVisible();
      await content.fill('노션형 피드 작성기 흐름 점검');
      await expect(page.locator('[data-cy="feed-editor-images"]')).toBeVisible();

      const linkInput = page.locator('[data-cy="feed-editor-link-input"]');
      await expect(linkInput).toBeVisible();
      await linkInput.fill('https://kscold.com/info/team');
      await expect(page.getByText('Colding 소개')).toBeVisible();

      await expect(page.locator('[data-cy="feed-editor-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-cy="feed-editor-upload"]')).toBeAttached();
      await expect(page.locator('[data-cy="feed-editor-visibility"]')).toBeVisible();
      await expect(page.locator('[data-cy="feed-editor-submit"]')).toBeAttached();

      await expectNoHorizontalOverflow(page, viewport.width);
    });
  }
});
