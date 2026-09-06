import { expect, test, type Page } from '@playwright/test';

const BUILD_API_ORIGIN = process.env.BUILD_API_ORIGIN || 'http://127.0.0.1:4100';

async function mockFilters(page: Page) {
  const requests: URL[] = [];
  const response = await page.request.get(`${BUILD_API_ORIGIN}/api/posts?page=0&size=12`);
  const { data } = await response.json();
  await page.route(/\/api\/posts\/(search|category\/[^?]+)\?/, async route => {
    const url = new URL(route.request().url());
    requests.push(url);
    const number = Number(url.searchParams.get('page'));
    await route.fulfill({
      json: {
        success: true,
        data: {
          ...data,
          number,
          totalElements: 24,
          totalPages: 2,
          content: [
            {
              ...data.content[0],
              title: `필터 ${url.searchParams.get('q') || '카테고리'} ${number} 글`,
            },
          ],
        },
      },
    });
  });
  return requests;
}

test('2페이지 검색은 API 0페이지부터 시작하고 검색어 변경도 0으로 초기화한다', async ({ page }) => {
  const requests = await mockFilters(page);
  await page.goto('/blog?page=2');
  const input = page.getByPlaceholder('포스트 검색...');
  await input.fill('Spring');
  await expect(page.getByRole('heading', { name: '필터 Spring 0 글' })).toBeVisible();
  await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
  await expect(page.getByRole('heading', { name: '필터 Spring 1 글' })).toBeVisible();
  await input.fill('MongoDB');
  await expect(page.getByRole('heading', { name: '필터 MongoDB 0 글' })).toBeVisible();
  expect(
    requests
      .filter(url => url.searchParams.get('q') === 'MongoDB')
      .map(url => url.searchParams.get('page'))
  ).toEqual(['0']);
  await input.fill('');
  await expect(page.getByRole('heading', { name: 'CI 아카이브 13 글' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: '블로그 페이지' }).locator('[aria-current="page"]')
  ).toHaveText('2');
  expect(requests[0].searchParams.get('page')).toBe('0');
});

test('카테고리는 별도 페이지를 쓰고 검색 중 카테고리 요청을 중단한다', async ({ page }) => {
  const requests = await mockFilters(page);
  await page.goto('/blog?page=2');
  await page.getByRole('button', { name: 'Engineering', exact: true }).click();
  await expect(page.getByRole('heading', { name: '필터 카테고리 0 글' })).toBeVisible();
  await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
  await expect(page.getByRole('heading', { name: '필터 카테고리 1 글' })).toBeVisible();
  const categoryCount = requests.filter(url => url.pathname.includes('/category/')).length;
  await page.getByPlaceholder('포스트 검색...').fill('Agent');
  await expect(page.getByRole('heading', { name: '필터 Agent 0 글' })).toBeVisible();
  await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
  await expect(page.getByRole('heading', { name: '필터 Agent 1 글' })).toBeVisible();
  expect(requests.filter(url => url.pathname.includes('/category/'))).toHaveLength(categoryCount);
  await page.getByPlaceholder('포스트 검색...').fill('');
  await page.getByRole('button', { name: '전체', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'CI 아카이브 13 글' })).toBeVisible();
});

test('URL 페이지가 바뀌면 검색 상태를 초기화한다', async ({ page }) => {
  await mockFilters(page);
  await page.goto('/blog');
  await page
    .getByRole('navigation', { name: '블로그 페이지' })
    .getByRole('link', { name: '2페이지로 이동' })
    .click();
  await expect(page.getByRole('heading', { name: 'CI 아카이브 13 글' })).toBeVisible();
  await page.getByPlaceholder('포스트 검색...').fill('Agent');
  await expect(page.getByRole('heading', { name: '필터 Agent 0 글' })).toBeVisible();
  await page.goBack();
  await expect(page.getByPlaceholder('포스트 검색...')).toHaveValue('');
  await expect(
    page.getByRole('navigation', { name: '블로그 페이지' }).locator('[aria-current="page"]')
  ).toHaveText('1');
});
