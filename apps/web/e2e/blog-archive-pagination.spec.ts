import { expect, test } from '@playwright/test';
import { parseBlogArchivePage } from '../src/widgets/blog/lib/blogArchivePage';

const isEmptyArchive = process.env.BUILD_BLOG_EMPTY === 'true';

test.describe('블로그 아카이브 페이지 계약', () => {
  test.skip(isEmptyArchive, '빈 아카이브는 별도 운영 서버에서 검증한다.');

  test('초기 HTML은 각 페이지의 글과 자기 URL 메타데이터를 제공한다', async ({ request }) => {
    const first = await request.get('/blog');
    const second = await request.get('/blog?page=2');
    const firstHtml = await first.text();
    const secondHtml = await second.text();
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    expect(firstHtml).toContain('href="/blog/engineering/ci-frontend-verification"');
    expect(firstHtml).not.toContain('href="/blog/engineering/ci-archive-13"');
    expect(secondHtml).toContain('href="/blog/engineering/ci-archive-13"');
    expect(secondHtml).not.toContain('href="/blog/engineering/ci-frontend-verification"');
    expect(firstHtml).toContain('href="/blog?page=2"');
    expect(secondHtml).toContain('href="/blog"');
    for (const [html, suffix] of [
      [firstHtml, '/blog'],
      [secondHtml, '/blog?page=2'],
    ]) {
      expect(html).toContain(`<link rel="canonical" href="https://kscold.com${suffix}"`);
      expect(html).toContain(`<meta property="og:url" content="https://kscold.com${suffix}"`);
      const schema = JSON.parse(
        html.match(/<script[^>]*id="blog-page"[^>]*>(.*?)<\/script>/)?.[1] || '{}'
      );
      expect(schema.url).toBe(`https://kscold.com${suffix}`);
      expect(schema['@id']).toBe(`https://kscold.com${suffix}#collection`);
    }
  });

  test('명시적 첫 페이지는 기본 아카이브로 영구 이동한다', async ({ request }) => {
    const response = await request.get('/blog?page=1', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe('/blog');
  });

  for (const query of [
    'page=',
    'page=0',
    'page=-1',
    'page=1.5',
    'page=abc',
    'page=01',
    'page=9007199254740992',
    'page=501',
    'page=2&page=3',
    'page=11',
    'page=999',
  ]) {
    test(`잘못되었거나 없는 페이지는 실제 404: ${query}`, async ({ request }) => {
      const response = await request.get(`/blog?${query}`);
      expect(response.status()).toBe(404);
      expect(await response.text()).not.toContain(
        'href="/blog/engineering/ci-frontend-verification"'
      );
    });
  }

  test('링크 이동과 뒤로·앞으로 가기는 해당 서버 페이지를 유지한다', async ({ page }) => {
    const postRequests: string[] = [];
    page.on('request', request => {
      if (new URL(request.url()).pathname === '/api/posts') postRequests.push(request.url());
    });
    await page.goto('/blog');
    const navigation = page.getByRole('navigation', { name: '블로그 페이지' });
    await expect(navigation.locator('[aria-current="page"]')).toHaveText('1');
    await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(0);
    await navigation.getByRole('link', { name: '2페이지로 이동' }).click();
    await expect(page).toHaveURL(/\/blog\?page=2$/);
    await expect(page.getByRole('heading', { name: 'CI 아카이브 13 글' })).toBeVisible();
    await page.goBack();
    await expect(navigation.locator('[aria-current="page"]')).toHaveText('1');
    await page.goForward();
    await expect(navigation.locator('[aria-current="page"]')).toHaveText('2');
    await page.waitForTimeout(500);
    expect(postRequests).toHaveLength(0);
  });

  test('깊은 페이지도 첫 페이지와 마지막 페이지를 직접 연결한다', async ({ page }) => {
    const response = await page.goto('/blog?page=6');
    const navigation = page.getByRole('navigation', { name: '블로그 페이지' });
    expect(response?.status()).toBe(200);
    await expect(navigation.getByRole('link', { name: '1페이지로 이동' })).toHaveAttribute(
      'href',
      '/blog'
    );
    await expect(navigation.getByRole('link', { name: '10페이지로 이동' })).toHaveAttribute(
      'href',
      '/blog?page=10'
    );
  });
});

test('빈 첫 아카이브는 200이고 2페이지는 404이다', async ({ request }) => {
  test.skip(
    !isEmptyArchive,
    '빈 응답 정책은 기본 CI에서 검사하며, 이 HTTP 검증은 BUILD_BLOG_EMPTY 전용 스텁과 격리된 캐시에서 실행한다.'
  );
  const first = await request.get('/blog');
  expect(first.status()).toBe(200);
  expect(await first.text()).toContain('포스트가 없습니다');
  expect((await request.get('/blog?page=2')).status()).toBe(404);
});

test('페이지 입력 파서는 중복과 잘못된 숫자를 거부한다', () => {
  expect(parseBlogArchivePage(undefined)).toBe(1);
  expect(parseBlogArchivePage('2')).toBe(2);
  for (const input of ['', '0', '-1', '1.2', 'NaN', 'Infinity', '01', '2147483648', ['2']]) {
    expect(parseBlogArchivePage(input)).toBeNull();
  }
});
