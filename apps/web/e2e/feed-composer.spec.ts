import { test, expect } from '@playwright/test';
import { success, emptyPage, mockApi, mockShellApis } from './support/api';
import { seedSession } from './support/auth';
import { expectNoHorizontalOverflow, VIEWPORTS } from './support/dom';

const FEED_USER = {
  id: 'user-1',
  email: 'feed-user@example.com',
  username: 'feeduser',
  displayName: '피드유저',
  role: 'USER' as const,
};

const LINK_PREVIEW = success({
  url: 'https://kscold.com/info/team',
  title: 'Colding 소개',
  description: '브랜드와 프로젝트 방향을 소개하는 안내 페이지입니다.',
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  siteName: 'KSCOLD',
});

test.describe('공개 피드 작성기 시나리오', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.label} 해상도에서도 로그인 사용자가 피드를 편하게 작성할 수 있다`, async ({
      page,
    }) => {
      await mockShellApis(page);
      await mockApi(page, 'GET', '**/api/auth/me', success(FEED_USER));
      await mockApi(page, 'GET', '**/api/link-preview*', LINK_PREVIEW);

      // 피드 목록 GET + 작성 POST 를 한 핸들러로 처리
      await page.route(/\/api\/feeds(\?|$)/, async route => {
        const req = route.request();
        if (req.method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(success(emptyPage(12))),
          });
          return;
        }
        if (req.method() === 'POST') {
          const body = req.postDataJSON();
          expect(body.content).toContain('공개 피드 작성기 시나리오');
          expect(body.linkUrl).toBe('https://kscold.com/info/team');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(
              success({
                id: 'feed-1',
                content: body.content,
                images: body.images ?? [],
                author: { id: 'user-1', name: '피드유저' },
                visibility: 'PUBLIC',
                linkPreview: LINK_PREVIEW.data,
                likesCount: 0,
                commentsCount: 0,
                views: 0,
                isLiked: false,
                createdAt: '2026-04-05T00:00:00',
                updatedAt: '2026-04-05T00:00:00',
              })
            ),
          });
          return;
        }
        await route.fallback();
      });

      await seedSession(page, FEED_USER);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/feed');

      await expect(page.locator('[data-cy="feed-composer"]')).toBeVisible();
      await expect(page.getByText('지금 흐름 남기기')).toBeVisible();
      await expect(page.getByText('이미지 바로 첨부')).toBeVisible();
      await expect(page.getByText('링크 함께 정리')).toBeVisible();

      const linkInput = page.locator('[data-cy="feed-composer-link-input"]');
      await expect(linkInput).toHaveCount(0);
      await page.getByText('링크와 이미지 더하기').click();
      await expect(linkInput).toBeVisible();
      await page.getByText('링크와 이미지 패널 닫기').click();
      await expect(linkInput).toHaveCount(0);

      const content = page.locator('[data-cy="feed-composer-content"]');
      await expect(content).toBeVisible();
      // content 입력 → hasDraft=true 라 패널이 자동 확장되어 link-input 이 다시 나타난다
      await content.fill('공개 피드 작성기 시나리오를 점검합니다.');
      await expect(linkInput).toBeVisible();
      await linkInput.fill('https://kscold.com/info/team');
      await expect(page.getByText('Colding 소개')).toBeVisible();

      await expect(page.locator('[data-cy="feed-composer-upload"]')).toBeAttached();
      await page.locator('[data-cy="feed-composer-submit"]').click();

      await expect(content).toHaveValue('');
      await expect(linkInput).toHaveCount(0);

      await expectNoHorizontalOverflow(page, viewport.width);
    });
  }
});
