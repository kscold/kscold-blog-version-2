import { expect, test } from '@playwright/test';
import { mockShellApis } from './support/api';

test.beforeEach(async ({ page }) => { await mockShellApis(page); });

test('홈 장식은 클릭을 가로채지 않고 주요 버튼으로 이동할 수 있다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [selector, path] of [
    ['[data-cy="hero-primary-cta"]', '/blog'],
    ['[data-cy="hero-secondary-cta"]', '/feed'],
    ['main a[href="/?chat=open"]', '/?chat=open'],
  ]) {
    await page.goto('/');
    const button = page.locator(selector);
    await expect(button).toBeVisible();
    await button.click();
    await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === path);
  }
});

test('홈의 소개와 탐색 링크는 서버 HTML에 있고 데스크톱 사이드바도 표시한다', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('김승찬의 기술 블로그');
  expect(html).not.toContain('home-manifesto');
  expect(html).not.toContain('home-connections');
  expect(html).toContain('Featured');
  expect(html).toContain('Admin Night 보러 가기');
  await page.goto('/');
  await expect(page.locator('aside:visible')).toHaveCount(1);
  await expect(page.locator('[data-cy="hero-primary-cta"]')).toHaveAttribute('href', '/blog');
  await expect(page.locator('[data-cy="hero-secondary-cta"]')).toHaveAttribute('href', '/feed');
  await expect(page.getByLabel('블로그 기능 탐색')).toHaveCount(0);
  await expect(page.locator('[data-scroll-scene]')).toHaveCount(0);
  await page.goto('/blog');
  await expect(page.locator('aside:visible')).toHaveCount(1);
});

test('움직임 줄이기에서는 3D와 고정 연출 없이 모든 탐색 단계를 읽을 수 있다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-scroll-scene][data-enhanced="true"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Admin Night 보러 가기' })).toBeVisible();
  await expect(page.getByRole('button', { name: '흐르는 문구 일시정지' })).toBeHidden();
});

for (const width of [320, 390, 440, 768, 1024, 1280, 1440]) {
  test(`홈 콘텐츠가 문서 가로 넘침을 만들지 않는다: ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.getByRole('link', { name: 'Admin Night 보러 가기' }).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const lastCard = page.getByRole('link', { name: 'Admin Night 보러 가기' });
    await lastCard.focus();
    await expect(lastCard).toBeInViewport();
    await expect(page.locator('footer')).toContainText('Colding. All rights reserved.');
  });
}

test('모바일 메뉴와 홈 주요 링크를 계속 사용할 수 있다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-cy="sidebar-toggle"]').click();
  await expect(page.locator('aside:visible')).toHaveCount(1);
});

test('모바일 아트와 소개는 겹치지 않고 주요 버튼까지 첫 화면에 표시한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const artwork = await page.getByTestId('hero-artwork').boundingBox();
  const title = await page.getByRole('heading', { level: 1 }).boundingBox();
  expect(artwork!.y + artwork!.height).toBeLessThan(title!.y);
  await expect(page.locator('[data-cy="hero-primary-cta"]')).toBeInViewport();
  await expect(page.locator('[data-cy="hero-secondary-cta"]')).toBeInViewport();
});
