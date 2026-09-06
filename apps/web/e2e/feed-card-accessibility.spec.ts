import { test, expect, type Page } from '@playwright/test';
import { mockApi, mockShellApis, pageOf, success } from './support/api';
import { seedSession } from './support/auth';

const FEED_USER = {
  id: 'feed-card-user',
  email: 'feed-card@example.com',
  username: 'feed-card-user',
  displayName: '피드 카드 사용자',
  role: 'USER' as const,
};

const FEED = {
  id: 'feed-accessible',
  content: '# 접근 가능한 피드\n캐러셀과 독립 링크 동작을 확인합니다.',
  images: ['/apple-touch-icon.png', '/images/teams/pawpong-logo.png'],
  tags: ['접근성'],
  author: {
    id: 'author-1',
    username: 'feed-author',
    name: '피드 작성자',
    avatar: '/apple-touch-icon.png',
  },
  visibility: 'PUBLIC' as const,
  linkPreview: {
    url: 'https://example.com/resource',
    title: '외부 참고 자료',
    description: '피드 카드와 별개로 열려야 하는 링크입니다.',
    siteName: 'Example',
  },
  likesCount: 4,
  commentsCount: 2,
  views: 10,
  isLiked: false,
  createdAt: '2026-09-06T00:00:00',
  updatedAt: '2026-09-06T00:00:00',
};

async function mockFeedCard(page: Page) {
  await mockShellApis(page);
  await seedSession(page, FEED_USER);
  await mockApi(page, 'GET', /\/api\/feeds(?:\?|$)/, success(pageOf([FEED], 12)));
  await mockApi(page, 'POST', '**/api/feeds', success(FEED));
  await mockApi(
    page,
    'POST',
    '**/api/feeds/feed-accessible/like',
    success({ ...FEED, isLiked: true, likesCount: 5 })
  );
}

async function loadFeedCard(page: Page) {
  await page.goto('/feed');
  await page.locator('[data-cy="feed-composer-content"]').fill('피드 카드 회귀 테스트');
  await page.locator('[data-cy="feed-composer-submit"]').click();
  await expect(page.getByRole('link', { name: '접근 가능한 피드 피드 보기' })).toBeVisible();
}

test.describe('피드 카드 링크와 이미지 접근성', () => {
  test.beforeEach(async ({ page }) => {
    await mockFeedCard(page);
  });

  test('카드와 내부 조작은 서로의 탐색을 가로채지 않는다', async ({ page }) => {
    await loadFeedCard(page);

    const detailLink = page.getByRole('link', { name: '접근 가능한 피드 피드 보기' });
    const carousel = page.getByRole('group', {
      name: '피드 작성자의 접근 가능한 피드 첨부 이미지',
    });
    await expect(detailLink).toHaveAttribute('href', '/feed/feed-accessible');
    await expect(page.locator('a a')).toHaveCount(0);

    await carousel.getByRole('button', { name: '다음 이미지 보기' }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(carousel.getByRole('status')).toHaveText('2 / 2');
    await expect(carousel.getByRole('button', { name: '2번 이미지 보기' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    await expect(carousel.getByRole('img', { name: /첨부 이미지 2$/ })).not.toHaveAttribute(
      'sizes',
      '100vw'
    );

    await page.getByRole('button', { name: '좋아요 4개' }).click();
    await expect(page).toHaveURL(/\/feed$/);

    const preview = page.getByRole('link', { name: /외부 참고 자료/ });
    const popupPromise = page.waitForEvent('popup');
    await preview.click();
    const popup = await popupPromise;
    await expect(page).toHaveURL(/\/feed$/);
    await popup.close();

    await detailLink.focus();
    await expect(detailLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/feed\/feed-accessible$/);
  });

  test('카드 오버레이는 포인터 클릭으로 상세에 이동한다', async ({ page }) => {
    await loadFeedCard(page);

    await page.getByRole('link', { name: '접근 가능한 피드 피드 보기' }).click();
    await expect(page).toHaveURL(/\/feed\/feed-accessible$/);
  });

  test('작성자 아바타는 고정 크기를 유지하고 필요한 해상도만 제공한다', async ({ page }) => {
    await loadFeedCard(page);

    const avatar = page.locator('article a[href="/profile/feed-author"] img');
    await expect(avatar).toHaveAttribute('width', '36');
    await expect(avatar).toHaveAttribute('height', '36');
    await expect(avatar).not.toHaveAttribute('sizes');
    const candidates = (await avatar.getAttribute('srcset'))?.split(',').map(value => value.trim());
    expect(candidates).toHaveLength(2);
    expect(candidates?.[0]).toMatch(/ 1x$/);
    expect(candidates?.[1]).toMatch(/ 2x$/);
    const box = await avatar.boundingBox();
    expect(box?.width).toBe(36);
    expect(box?.height).toBe(36);
  });

  test('모바일에서도 캐러셀 조작부가 보이고 충분히 크다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loadFeedCard(page);

    const carousel = page.getByRole('group', {
      name: '피드 작성자의 접근 가능한 피드 첨부 이미지',
    });
    const nextButton = carousel.getByRole('button', { name: '다음 이미지 보기' });
    const firstDot = carousel.getByRole('button', { name: '1번 이미지 보기' });
    await expect(nextButton).toBeVisible();

    const nextBox = await nextButton.boundingBox();
    const dotBox = await firstDot.boundingBox();
    expect(nextBox?.width).toBeGreaterThanOrEqual(44);
    expect(nextBox?.height).toBeGreaterThanOrEqual(44);
    expect(dotBox?.width).toBeGreaterThanOrEqual(24);
    expect(dotBox?.height).toBeGreaterThanOrEqual(24);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
