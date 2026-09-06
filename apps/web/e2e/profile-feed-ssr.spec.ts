import { expect, test, type APIRequestContext } from '@playwright/test';
import { toFeedPreview } from '../src/shared/lib/seo/text';

const BUILD_API_ORIGIN = process.env.BUILD_API_ORIGIN || 'http://127.0.0.1:4100';
const feedFallbackScenarios = [
  ['ci-feed-failure', '503 응답'],
  ['ci-feed-not-found', '404 응답'],
  ['ci-feed-invalid', '형식 오류 응답'],
] as const;

interface ProfilePageJsonLd {
  '@type'?: string;
  hasPart?: Array<{ '@id'?: string }>;
}

function getProfilePageJsonLd(html: string, scriptId: string): ProfilePageJsonLd {
  const escapedId = scriptId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const scriptMatch = html.match(
    new RegExp(`<script[^>]*id="${escapedId}"[^>]*>([\\s\\S]*?)<\\/script>`)
  );

  expect(scriptMatch).not.toBeNull();
  const jsonLd = JSON.parse(scriptMatch?.[1] ?? '{}') as {
    '@graph'?: ProfilePageJsonLd[];
  };
  const profilePage = jsonLd['@graph']?.find(node => node['@type'] === 'ProfilePage');
  expect(profilePage).toBeDefined();
  return profilePage ?? {};
}

async function getStubRequestCount(request: APIRequestContext, pathname: string) {
  const response = await request.get(
    `${BUILD_API_ORIGIN}/__request-count?pathname=${encodeURIComponent(pathname)}`
  );
  return Number(await response.text());
}

test.describe('공개 프로필 피드 SSR', () => {
  test('초기 HTML에는 공개 피드 링크와 색인 가능한 구조화 데이터만 포함한다', async ({
    request,
  }) => {
    const response = await request.get('/profile/kscold');
    const html = await response.text();
    const profilePage = getProfilePageJsonLd(html, 'profile-kscold');
    const hasPart = JSON.stringify(profilePage.hasPart ?? []);

    expect(response.status()).toBe(200);
    expect(html).toContain('href="/feed/ci-indexable-feed"');
    expect(html).toContain('href="/feed/ci-short-feed"');
    expect(html).not.toContain('ci-private-feed');
    expect(html).not.toContain('PROFILE_FEED_HEADING_TAIL');
    expect(html).not.toContain('PROFILE_FEED_RAW_TAIL');
    expect(hasPart).toContain('/feed/ci-indexable-feed#posting');
    expect(hasPart).not.toContain('ci-short-feed');
    expect(hasPart).not.toContain('ci-private-feed');
  });

  for (const [username, caseName] of feedFallbackScenarios) {
    test(`피드 API ${caseName}이 프로필 응답을 실패시키지 않는다`, async ({ request }) => {
      const response = await request.get(`/profile/${username}`);
      const html = await response.text();

      expect(response.status()).toBe(200);
      expect(html).toContain('피드를 불러오지 못했습니다.');
    });
  }

  test('느린 피드 API를 짧게 중단하고 프로필 폴백을 반환한다', async ({ request }) => {
    const startedAt = Date.now();
    const response = await request.get('/profile/ci-feed-slow');
    const elapsedMs = Date.now() - startedAt;
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(html).toContain('CI 피드 지연 프로필');
    expect(html).toContain('피드를 불러오지 못했습니다.');
    expect(elapsedMs).toBeLessThan(3_500);
  });

  test('초기 데이터 hydration은 피드 첫 페이지를 다시 요청하지 않는다', async ({
    page,
  }) => {
    const browserFeedRequests: string[] = [];
    page.on('request', browserRequest => {
      if (new URL(browserRequest.url()).pathname === '/api/users/kscold/feeds') {
        browserFeedRequests.push(browserRequest.url());
      }
    });

    await page.goto('/profile/kscold');
    await expect(page.locator('a[href="/feed/ci-indexable-feed"]').first()).toBeVisible();
    await page.waitForTimeout(500);

    expect(browserFeedRequests).toHaveLength(0);
  });

  test('다음 버튼은 두 번째 페이지를 조회해 새 피드 카드를 표시한다', async ({ page }) => {
    const secondPageRequests: string[] = [];
    page.on('request', browserRequest => {
      const requestUrl = new URL(browserRequest.url());
      if (
        browserRequest.method() === 'GET' &&
        requestUrl.pathname === '/api/users/kscold/feeds' &&
        requestUrl.searchParams.get('page') === '1'
      ) {
        secondPageRequests.push(browserRequest.url());
      }
    });

    await page.goto('/profile/kscold');
    await page.getByRole('button', { name: '다음' }).click();
    await expect(page.locator('a[href="/feed/ci-second-page-feed"]').first()).toBeVisible();

    expect(secondPageRequests).toHaveLength(1);
    expect(new URL(secondPageRequests[0]).searchParams.get('size')).toBe('12');
  });

  test('긴 Markdown 제목을 별도 상한으로 줄이고 계속 읽기 상태를 유지한다', () => {
    const preview = toFeedPreview(
      `# ${'긴 제목 '.repeat(60)}PROFILE_FEED_HEADING_TAIL\n짧은 본문`
    );

    expect(preview.heading?.length).toBeLessThanOrEqual(160);
    expect(preview.heading).toMatch(/\.\.\.$/);
    expect(preview.heading).not.toContain('PROFILE_FEED_HEADING_TAIL');
    expect(preview.hasMore).toBe(true);
  });

  test('없는 프로필은 피드 API를 조회하지 않고 바로 404를 반환한다', async ({ request }) => {
    const pathname = '/api/users/ci-missing-profile/feeds';
    const beforeCount = await getStubRequestCount(request, pathname);
    const response = await request.get('/profile/ci-missing-profile');

    expect(response.status()).toBe(404);
    expect(await getStubRequestCount(request, pathname)).toBe(beforeCount);
  });
});
