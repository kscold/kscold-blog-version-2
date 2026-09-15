import { expect, test } from '@playwright/test';

for (const path of ['/blog/tags/public', '/tags/Public']) {
  test(`${path} 기본 전체와 블로그·피드 탭 및 페이지 URL을 유지한다`, async ({ page }) => {
    await page.goto(path);
    const tabs = page.getByRole('navigation', { name: '태그 콘텐츠 구분' });
    await expect(tabs.getByRole('link', { name: '전체 44' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    const posts = page.getByRole('region', { name: '태그 블로그 목록' });
    const feeds = page.getByRole('region', { name: '태그 피드 목록' });
    await expect(posts).toBeVisible();
    await expect(feeds.getByRole('heading', { name: '태그 피드 1', exact: true })).toBeVisible();
    await tabs.getByRole('link', { name: '피드 25' }).click();
    await expect(page).toHaveURL(`${path}?type=feed`);
    await expect(posts).toHaveCount(0);
    await feeds.getByRole('button', { name: '3페이지로 이동' }).click();
    await expect(page).toHaveURL(`${path}?type=feed&feedPage=3`);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(feeds.getByRole('heading', { name: '태그 피드 25', exact: true })).toBeVisible();
    await page.reload();
    await expect(feeds.getByText('3 / 3 페이지')).toBeVisible();
    await page
      .getByRole('navigation', { name: '태그 포스트 정렬' })
      .getByRole('link', { name: '인기순' })
      .click();
    await expect(page).toHaveURL(`${path}?sort=popular&type=feed`);
    await expect(feeds.getByRole('heading', { name: '태그 피드 25', exact: true })).toBeVisible();
    await expect(feeds.getByText('1 / 3 페이지')).toBeVisible();
    await tabs.getByRole('link', { name: '블로그 19' }).click();
    await expect(page).toHaveURL(`${path}?sort=popular&type=blog`);
    await expect(feeds).toHaveCount(0);
    await expect(posts.getByRole('heading', { name: 'CI public 19 글' })).toBeVisible();
    await tabs.getByRole('link', { name: '전체 44' }).click();
    await expect(posts).toBeVisible();
    await expect(feeds).toBeVisible();
  });
}

test('피드 API 장애는 빈 목록 대신 재시도 안내를 표시한다', async ({ page }) => {
  await page.route('**/api/feeds?**', route =>
    route.fulfill({ status: 503, json: { message: 'unavailable' } })
  );
  await page.goto('/blog/tags/public?type=feed');
  await expect(
    page.getByRole('alert').filter({ hasText: '피드를 불러오지 못했습니다.' })
  ).toBeVisible({ timeout: 20000 });
});

test('모바일 전체 화면은 탭과 피드를 가로 넘침 없이 표시한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog/tags/public');
  await expect(page.getByRole('navigation', { name: '태그 콘텐츠 구분' })).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: '태그 피드 목록' })
      .getByRole('heading', { name: '태그 피드 1', exact: true })
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('등록 태그의 잘못된 콘텐츠 필터와 피드 페이지를 거부한다', async ({ request }) => {
  for (const query of [
    'type=other',
    'type=blog&type=feed',
    'feedPage=0',
    'feedPage=abc',
    'feedPage=501',
  ]) {
    expect((await request.get(`/blog/tags/public?${query}`)).status()).toBe(404);
  }
});

test('전체 화면의 블로그와 피드 페이지는 서로의 위치를 보존한다', async ({ page }) => {
  await page.goto('/blog/tags/public?page=2');
  const feeds = page.getByRole('region', { name: '태그 피드 목록' });
  await feeds.getByRole('button', { name: '2페이지로 이동' }).click();
  await expect(page).toHaveURL('/blog/tags/public?feedPage=2&page=2');
  await expect(page.getByRole('heading', { name: 'CI public 13 글' })).toBeVisible();
  await expect(feeds.getByRole('heading', { name: '태그 피드 13', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Public 태그 페이지', exact: true }).getByRole('link', { name: '1페이지로 이동' }).click();
  await expect(page).toHaveURL('/blog/tags/public?feedPage=2');
  await expect(feeds.getByRole('heading', { name: '태그 피드 13', exact: true })).toBeVisible();
});
