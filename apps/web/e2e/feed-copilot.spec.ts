import { expect, test, type Page } from '@playwright/test';
import { emptyPage, mockApi, mockShellApis, success } from './support/api';
import { seedSession } from './support/auth';

const USER = {
  id: 'copilot-user',
  email: 'copilot@example.com',
  username: 'copilot',
  displayName: '피드 작성자',
  role: 'USER' as const,
};

const PLAN = {
  title: 'Agent 검색 흐름을 다시 본 기록',
  angle: '작게 확인한 문제와 다음 검증 지점을 공유합니다.',
  keyPoints: ['검색 범위', '말투 참고', '다음 검증'],
  sourceSummary: '외부 글의 핵심을 피드 작성 맥락으로 정리했습니다.',
  references: [
    {
      id: 'post-1',
      title: '이전에 작성한 Agent 회고',
      slug: 'agent-retrospective',
      score: 0.9,
      type: 'blog',
      path: '/blog/agent-retrospective',
      excerpt: '짧은 문장으로 문제와 확인 결과를 나눈 기록입니다.',
    },
  ],
};

const LONG_DRAFT = Array.from(
  { length: 28 },
  (_, index) => `${index + 1}번째 문단에서 Agent 검색 흐름의 검증 결과를 정리합니다.`
).join('\n\n');

const DRAFT = {
  title: 'Agent 검색 흐름을 다시 확인했다',
  content: LONG_DRAFT,
  tags: ['Agent', '개발회고'],
  references: PLAN.references,
};

async function mockFeedPage(page: Page) {
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/auth/me', success(USER));
  await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage(12)));
  await mockApi(
    page,
    'GET',
    '**/api/link-preview*',
    success({
      url: 'https://example.com/agent',
      title: '외부 Agent 글',
      description: 'Agent 검색 흐름을 설명하는 글입니다.',
      image: '',
      siteName: 'Example',
    })
  );
  await mockApi(page, 'POST', '**/api/feeds/copilot/plan', success(PLAN));
}

test('말투 참고 초안을 끝까지 확인하고 최신 입력만 본문에 적용한다', async ({ page }) => {
  await mockFeedPage(page);
  await page.route('**/api/feeds/copilot/draft', async route => {
    const body = route.request().postDataJSON();
    expect(body.styleReferenceKeys).toEqual(['blog:post-1']);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success(DRAFT)),
    });
  });
  await seedSession(page, USER);
  await page.goto('/feed');

  const composer = page.locator('[data-testid="feed-composer"]');
  const copilot = composer.locator('[data-testid="feed-copilot"]');
  const sourceInput = copilot.locator('[data-testid="feed-copilot-source-url"]');
  const contentInput = composer.locator('[data-testid="feed-composer-content"]');

  await contentInput.fill('Agent 검색 결과를 다시 확인한 메모');
  await copilot.locator('button').first().click();
  await sourceInput.fill('https://example.com/agent');
  await copilot.getByRole('button', { name: '작성 계획 세우기' }).click();
  await expect(copilot.getByText(PLAN.title)).toBeVisible();

  await copilot.getByRole('button', { name: '글의 결 참고' }).click();
  await copilot.getByRole('button', { name: '이 방향으로 초안 만들기' }).click();
  await expect(copilot.getByText('28번째 문단에서 Agent 검색 흐름의 검증 결과를 정리합니다.')).toBeVisible();

  const applyButton = copilot.getByRole('button', { name: '본문에 적용하기' });
  await sourceInput.fill('https://example.com/changed');
  await expect(applyButton).toBeDisabled();
  await expect(copilot.getByText(/현재 입력으로 초안을 다시 만들어주세요/)).toBeVisible();

  await sourceInput.fill('https://example.com/agent');
  await expect(applyButton).toBeEnabled();
  await applyButton.click();
  await expect(contentInput).toHaveValue(new RegExp('28번째 문단'));
  await expect(contentInput).toHaveValue(new RegExp('#Agent #개발회고'));
});

for (const width of [1440, 390]) {
  test(`초안 도우미는 피드 작성 영역에서 본문을 채운다 (${width})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 960 });
    await mockFeedPage(page);
    await mockApi(page, 'POST', '**/api/feeds/copilot/draft', success({
      ...DRAFT, content: '기록의 출처와 공개 범위를 확인했습니다.\n\n작성일을 기준으로 최근 피드를 살폈습니다.',
    }));
    await seedSession(page, USER);
    let published = false;
    await page.route('**/api/feeds', async route => {
      if (route.request().method() === 'POST') published = true;
      await route.fallback();
    });
    await page.goto('/feed?chat=open&chatMode=feed');
    await expect(page).toHaveURL(/\/feed\?draft=open/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const composer = page.getByTestId('feed-composer');
    const copilot = composer.getByTestId('feed-copilot');
    const content = composer.getByTestId('feed-composer-content');
    await content.fill('작성 폼에서 검색 범위를 확인한 메모');
    await copilot.getByRole('button', { name: '작성 계획 세우기' }).click();
    await copilot.getByRole('button', { name: '이 방향으로 초안 만들기' }).click();
    await copilot.getByRole('button', { name: '본문에 적용하기' }).click();
    await expect(content).toHaveValue(/기록의 출처와 공개 범위/);
    await expect(content).toHaveValue(/#Agent #개발회고/);
    expect(published).toBe(false);
    await copilot.getByRole('button').first().click();
    await expect(copilot.getByTestId('feed-copilot-source-url')).toBeHidden();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`feed-draft-${width}.png`), fullPage: true });
  });
}

test('이전 화면이 전달한 초안을 복원하고 저장소 차단 시에도 작성기를 연다', async ({ page }) => {
  await mockFeedPage(page);
  await seedSession(page, USER);
  await page.addInitScript(() => {
    sessionStorage.setItem('kscold-feed-copilot-draft', JSON.stringify({
      title: '이전에 만든 제목', content: '이전에 만든 본문', tags: ['기록'], sourceUrl: '',
    }));
  });
  await page.goto('/feed');
  await expect(page.getByTestId('feed-composer-content')).toHaveValue(/이전에 만든 본문/);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } });
  });
  await page.reload();
  await expect(page.getByTestId('feed-composer-content')).toBeVisible();
});

test('로그인하지 않은 방문자에게 초안 도우미를 노출하지 않는다', async ({ page }) => {
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/auth/me', success(null));
  await page.goto('/feed?draft=open');
  await expect(page.getByRole('link', { name: '로그인하고 글 쓰기' })).toBeVisible();
  await expect(page.getByTestId('feed-copilot')).toHaveCount(0);
});

test('긴 피드 본문은 게시할 수 있지만 Copilot 메모 한도는 이유와 함께 안내한다', async ({
  page,
}) => {
  await mockFeedPage(page);
  await seedSession(page, USER);
  await page.goto('/feed');

  const composer = page.locator('[data-testid="feed-composer"]');
  const contentInput = composer.locator('[data-testid="feed-composer-content"]');
  const submitButton = composer.locator('[data-testid="feed-composer-submit"]');
  await expect(async () => {
    await contentInput.fill('가'.repeat(4_001));
    await expect(submitButton).toBeEnabled();
  }).toPass();

  const copilot = composer.locator('[data-testid="feed-copilot"]');
  await copilot.locator('button').first().click();
  await expect(copilot.locator('[data-testid="feed-copilot-memo-error"]')).toContainText(
    '최대 4,000자'
  );
  await expect(copilot.getByRole('button', { name: '작성 계획 세우기' })).toBeDisabled();
  await expect(submitButton).toBeEnabled();
});
