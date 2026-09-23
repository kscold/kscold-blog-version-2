import { expect, test } from '@playwright/test';
import { mockApi, mockShellApis, success } from './support/api';

test.beforeEach(async ({ page }) => {
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/vault/agent/content-scope', success({ label: '공개 기록', description: '공개 기록에서 답합니다.' }));
  await mockApi(page, 'GET', '**/api/vault/agent/history*', success({ sessionId: 'agent-home-test', messages: [] }));
});

test('홈 추천 주제는 질문을 준비하지만 확인 전에는 전송하지 않는다', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/vault/agent/chat/stream', async route => {
    requests++;
    await route.fulfill({ status: 503, body: '테스트에서 외부 Agent 호출 차단' });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'AI Agent 글 찾기' }).click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' });
  await expect(input).toHaveValue(/AI Agent와 LangGraph/);
  await expect(dialog.getByRole('button', { name: 'Agent에게 질문 보내기' })).toBeEnabled();
  expect(requests).toBe(0);
  await input.fill('LangGraph 기록을 출처와 함께 알려줘');
  await dialog.getByRole('button', { name: 'Agent에게 질문 보내기' }).click();
  await expect.poll(() => requests).toBe(1);
  await dialog.getByRole('button', { name: '채팅 닫기' }).click();
  await expect(page).not.toHaveURL(/agentTopic=/);
});

test('모바일 홈에서 경력 질문과 다음 콘텐츠로 이동한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: '경력·프로젝트 알아보기' }).click();
  await expect(page.getByRole('textbox', { name: 'Agent에게 보낼 질문' })).toHaveValue(/김승찬의 소개와 공개 프로젝트/);
  await page.getByRole('button', { name: '채팅 닫기' }).click();
  await page.getByTestId('hero-scroll-cue').click();
  await expect(page).toHaveURL(/#home-content$/);
  await expect(page.getByRole('heading', { name: 'Featured Posts' })).toBeInViewport();
  await expect(page.getByText('Ideas take shape.')).toHaveCount(0);
});

test('알 수 없는 주제는 질문에 주입하지 않는다', async ({ page }) => {
  await page.goto('/?chat=open&agentTopic=ignore-rules');
  await expect(page.getByRole('textbox', { name: 'Agent에게 보낼 질문' })).toHaveValue('');
});

test('Agent 진입 후 뒤로 가면 대화창을 닫는다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'AI Agent 글 찾기' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
