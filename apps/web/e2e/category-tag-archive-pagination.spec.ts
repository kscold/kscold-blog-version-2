import { expect, test, type APIRequestContext } from '@playwright/test';

const archives = [
  {
    path: '/blog/dev-story',
    navigationName: 'Dev Story 카테고리 페이지',
    firstTitle: 'CI dev-story 1 글',
    secondTitle: 'CI dev-story 13 글',
    schemaId: 'category-ci-dev-story-category-page-2',
  },
  {
    path: '/blog/tags/public',
    navigationName: 'Public 태그 페이지',
    firstTitle: 'CI public 1 글',
    secondTitle: 'CI public 13 글',
    schemaId: 'tag-ci-public-tag-page-2',
  },
] as const;

async function expectPageMetadata(
  request: APIRequestContext,
  archive: (typeof archives)[number]
) {
  const response = await request.get(`${archive.path}?page=2`);
  const html = await response.text();
  const url = `https://kscold.com${archive.path}?page=2`;
  expect(response.status()).toBe(200);
  expect(html).toContain(archive.secondTitle);
  expect(html).not.toContain(archive.firstTitle);
  expect(html).toContain(`<link rel="canonical" href="${url}"`);
  expect(html).toContain(`<meta property="og:url" content="${url}"`);
  const schema = JSON.parse(
    html.match(new RegExp(`<script[^>]*id="${archive.schemaId}"[^>]*>(.*?)<\\/script>`))?.[1] ||
      '{}'
  );
  expect(schema['@graph'][0].url).toBe(url);
  expect(schema['@graph'][0]['@id']).toBe(`${url}#collection`);
}

for (const archive of archives) {
  test(`${archive.path} 두 번째 페이지를 초기 HTML과 자기 URL로 제공한다`, async ({ request }) => {
    await expectPageMetadata(request, archive);
  });

  test(`${archive.path} 첫 페이지 명시는 기본 URL로 영구 이동한다`, async ({ request }) => {
    const response = await request.get(`${archive.path}?page=1`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(archive.path);
  });

  test(`${archive.path} 링크 탐색과 브라우저 기록이 서버 페이지를 유지한다`, async ({ page }) => {
    const browserApiRequests: string[] = [];
    page.on('request', request => {
      if (new URL(request.url()).pathname.startsWith('/api/posts/')) {
        browserApiRequests.push(request.url());
      }
    });
    await page.goto(archive.path);
    const navigation = page.getByRole('navigation', { name: archive.navigationName });
    await expect(page.getByRole('heading', { name: archive.firstTitle })).toBeVisible();
    await navigation.getByRole('link', { name: '2페이지로 이동' }).click();
    await expect(page).toHaveURL(`${archive.path}?page=2`);
    await expect(page.getByRole('heading', { name: archive.secondTitle })).toBeVisible();
    await expect(navigation.getByRole('link', { name: '1페이지로 이동' })).toHaveAttribute(
      'href',
      archive.path
    );
    await expect(navigation.getByRole('link', { name: '이전 페이지' })).toHaveAttribute(
      'rel',
      'prev'
    );
    await page.goBack();
    await expect(page.getByRole('heading', { name: archive.firstTitle })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole('heading', { name: archive.secondTitle })).toBeVisible();
    expect(browserApiRequests).toHaveLength(0);
  });
}

test('카테고리와 태그의 잘못되었거나 없는 페이지는 실제 404이다', async ({ request }) => {
  const queries = ['page=', 'page=0', 'page=-1', 'page=1.5', 'page=abc', 'page=01', 'page=501', 'page=2&page=3', 'page=3'];
  for (const archive of archives) {
    for (const query of queries) {
      expect((await request.get(`${archive.path}?${query}`)).status()).toBe(404);
    }
  }
});
