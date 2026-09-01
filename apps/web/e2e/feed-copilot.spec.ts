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

  const composer = page.locator('[data-cy="feed-composer"]');
  const copilot = composer.locator('[data-cy="feed-copilot"]');
  const sourceInput = copilot.locator('[data-cy="feed-copilot-source-url"]');
  const contentInput = composer.locator('[data-cy="feed-composer-content"]');

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

test('채팅 모달에서 만든 피드 초안을 작성기로 잃지 않고 전달한다', async ({ page }) => {
  await mockFeedPage(page);
  await mockApi(page, 'POST', '**/api/feeds/copilot/draft', success(DRAFT));
  await mockApi(
    page,
    'GET',
    '**/api/vault/agent/content-scope',
    success({ label: '전체 기록', description: '허용된 기록을 검색합니다.' })
  );
  await mockApi(
    page,
    'GET',
    '**/api/vault/agent/history*',
    success({ sessionId: 'feed-transfer', messages: [] })
  );
  await seedSession(page, USER);
  await page.goto('/feed');

  await page.getByRole('button', { name: 'KSCOLD 대화 열기' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', { name: '피드 초안' }).click();
  await dialog.locator('[data-cy="feed-copilot-memo"]').fill('모달에서 만든 피드 메모');
  await dialog.getByRole('button', { name: '작성 계획 세우기' }).click();
  await dialog.getByRole('button', { name: '이 방향으로 초안 만들기' }).click();
  await dialog.getByRole('button', { name: '본문에 적용하기' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-cy="feed-composer-content"]')).toHaveValue(
    new RegExp('28번째 문단')
  );
});
