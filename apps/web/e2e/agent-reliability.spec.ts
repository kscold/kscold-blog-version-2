import { expect, test, type Page } from '@playwright/test';
import { sourceHref } from '../src/features/chat/lib/agentConstants';
import { failAgentMessage, interruptAgentMessage } from '../src/widgets/chat/model/agentMessageState';
import { mockApi, mockShellApis, success } from './support/api';
import { seedSession } from './support/auth';

const source = { id: 'record', title: '기록', slug: '기록', score: 1 };
const completed = {
  sessionId: 'reliability-session', answer: '정상적으로 다시 받은 답변입니다.',
  stages: [], sources: [], followUps: [],
};
const packet = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

async function prepareChat(page: Page) {
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/auth/me', success(null));
  await mockApi(page, 'GET', '**/api/vault/agent/content-scope', success({
    label: '공개 기록', description: '공개된 기록을 검색합니다.',
  }));
  await mockApi(page, 'GET', '**/api/vault/agent/history*', success({
    sessionId: 'reliability-session', messages: [],
  }));
}

test('내부 출처의 검색 조건과 앵커를 보존한다', () => {
  expect(sourceHref({ ...source, path: '/blog/topic?sort=recent#detail' }))
    .toBe('/blog/topic?sort=recent&chat=open#detail');
  expect(sourceHref({ ...source, path: '/feed/abc?chat=closed#source' }))
    .toBe('/feed/abc?chat=open#source');
});

test('외부 HTTPS 출처에는 내부 대화 파라미터를 추가하지 않는다', () => {
  expect(sourceHref({ ...source, path: 'https://example.com/docs?q=ai#section' }))
    .toBe('https://example.com/docs?q=ai#section');
});

test('실행 프로토콜과 프로토콜 상대 출처는 안전한 내부 노트로 돌린다', () => {
  for (const path of ['javascript:alert(1)', 'data:text/html,unsafe', '//example.com', '/\\example.com', 'https://user:pass@example.com']) {
    expect(sourceHref({ ...source, path })).toBe('/vault/%EA%B8%B0%EB%A1%9D?chat=open');
  }
});

test('오류와 사용자의 수신 중단 이후에도 받은 부분 답변을 보존한다', () => {
  const messages = [{ id: 'answer', role: 'assistant' as const, content: '이미 받은 설명', isStreaming: true }];
  expect(failAgentMessage(messages, 'answer', '연결 오류')[0]).toMatchObject({
    content: '이미 받은 설명', responseStatus: 'error', isStreaming: false,
  });
  const interrupted = interruptAgentMessage(messages, 'answer', true)[0];
  expect(interrupted).toMatchObject({ content: '이미 받은 설명', responseStatus: 'interrupted', isStreaming: false });
  expect(interrupted.stages?.at(-1)?.detail).toContain('요청에 따라');
});

test('같은 순간의 중복 제출을 막고 답변 수신을 직접 중단할 수 있다', async ({ page }) => {
  await prepareChat(page);
  let requestCount = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/vault/agent/chat/stream', async route => {
    requestCount += 1;
    await gate;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: packet('complete', completed) }).catch(() => undefined);
  });
  await page.goto('/feed?chat=open');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' }).fill('AI Agent 관련 기록 알려줘');
  const submit = dialog.getByRole('button', { name: 'Agent에게 질문 보내기' });
  await expect(submit).toBeEnabled();
  await submit.evaluate(button => {
    const form = button.closest('form');
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await expect.poll(() => requestCount).toBe(1);
  await dialog.getByRole('button', { name: 'Agent 답변 수신 중단' }).click();
  await expect(dialog.getByRole('button', { name: '마지막 질문 다시 보내기' })).toBeVisible();
  await expect(dialog.getByRole('status')).toContainText('답변 수신을 멈췄어요');
  expect(requestCount).toBe(1);
  release();
});

test('연결 오류의 부분 답변을 보존하고 같은 질문으로 재시도한다', async ({ page }) => {
  await prepareChat(page);
  const questions: string[] = [];
  await page.route('**/api/vault/agent/chat/stream', async route => {
    questions.push(route.request().postDataJSON().message);
    const body = questions.length === 1
      ? packet('delta', { delta: '여기까지 정리한 내용입니다.' }) + packet('error', { message: '테스트 연결 오류' })
      : packet('complete', completed);
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body });
  });
  await page.goto('/feed?chat=open');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' }).fill('블로그에서 AI Agent 관련 글 찾아줘');
  await dialog.getByRole('button', { name: 'Agent에게 질문 보내기' }).click();
  await expect(dialog.getByText('여기까지 정리한 내용입니다.')).toBeVisible();
  await expect(dialog.getByRole('status')).toContainText('답변을 마치지 못했어요');
  await dialog.getByRole('button', { name: '마지막 질문 다시 보내기' }).click();
  await expect(dialog.getByText(completed.answer)).toBeVisible();
  expect(questions).toEqual(['블로그에서 AI Agent 관련 글 찾아줘', '블로그에서 AI Agent 관련 글 찾아줘']);
  await expect(dialog.getByRole('button', { name: '마지막 질문 다시 보내기' })).toHaveCount(0);
});

test('이전 대화 요청이 늦게 도착해도 다시 연 창의 새 기록을 덮어쓰지 않는다', async ({ page }) => {
  await prepareChat(page);
  let requestCount = 0;
  let reopened = false;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/vault/agent/history*', async route => {
    requestCount += 1;
    const isOldRequest = !reopened;
    if (isOldRequest) await gate;
    const sequence = isOldRequest ? 1 : 2;
    await route.fulfill({ json: success({
      sessionId: `history-${sequence}`,
      messages: [{ id: String(sequence), role: 'assistant', content: `기록 응답 ${sequence}`, stages: [], sources: [] }],
    }) });
  });
  await page.goto('/feed?chat=open');
  await expect.poll(() => requestCount).toBeGreaterThan(0);
  await page.getByRole('button', { name: '채팅 닫기' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  reopened = true;
  await page.getByRole('button', { name: 'KSCOLD 대화 열기' }).click();
  await expect(page.getByRole('dialog').getByText('기록 응답 2')).toBeVisible();
  release();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('kscold-agent-chat-session-id'))).toBe('history-2');
  await expect(page.getByRole('dialog').getByText('기록 응답 1')).toHaveCount(0);
});

test('현재 사용자가 해제되면 기존 권한의 대화와 입력을 지우고 새 기록을 조회한다', async ({ page }) => {
  await prepareChat(page);
  await seedSession(page, {
    id: 'agent-viewer', username: 'viewer', displayName: '검증 사용자',
    email: 'viewer@example.com', role: 'USER',
  });
  let releaseIdentity!: () => void;
  let identityReleased = false;
  const identityGate = new Promise<void>(resolve => { releaseIdentity = resolve; });
  await page.route('**/api/auth/me', async route => {
    await identityGate;
    await route.fulfill({ json: success(null) });
  });
  const sessions: string[] = [];
  await page.route('**/api/vault/agent/history*', async route => {
    const sessionId = new URL(route.request().url()).searchParams.get('sessionId') || '';
    sessions.push(sessionId);
    await route.fulfill({ json: success({
      sessionId,
      messages: !identityReleased
        ? [{ id: 'private-answer', role: 'assistant', content: '이전 사용자만 보던 답변', stages: [], sources: [] }]
        : [],
    }) });
  });
  await page.goto('/feed?chat=open');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('이전 사용자만 보던 답변')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' }).fill('이전 사용자의 작성 중인 질문');
  const previousSession = sessions.at(-1);
  const previousRequestCount = sessions.length;
  identityReleased = true;
  releaseIdentity();
  await expect(dialog.getByText('이전 사용자만 보던 답변')).toHaveCount(0);
  await expect(dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' })).toHaveValue('');
  await expect.poll(() => sessions.length).toBeGreaterThan(previousRequestCount);
  expect(sessions.at(-1)).not.toBe(previousSession);
});
