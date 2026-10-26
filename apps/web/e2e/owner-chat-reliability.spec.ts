import { expect, test, type Page, type WebSocketRoute } from '@playwright/test';
import { success } from './support/api';
import { seedSession } from './support/auth';
import { prepareAgentChat } from './support/agent-chat';

async function prepareOwnerChat(page: Page) {
  await prepareAgentChat(page);
  await seedSession(page, { id: 'chat-user', username: 'chat-user', displayName: '대화 사용자', email: 'chat@example.com', role: 'USER' });
  let socket!: WebSocketRoute;
  await page.routeWebSocket(/\/api\/ws\//, ws => { socket = ws; });
  await page.route('**/api/chat/messages*', route => route.request().method() === 'GET'
    ? route.fulfill({ json: success([]) }) : route.fallback());
  await page.goto('/feed?chat=open');
  await page.getByRole('tab', { name: '주인에게 남기기' }).click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox', { name: '블로그 주인에게 보낼 메시지' });
  const button = dialog.getByRole('button', { name: '블로그 주인에게 메시지 보내기' });
  await input.fill('안녕하세요. 문의드립니다.');
  await expect(button).toBeEnabled();
  await expect.poll(() => Boolean(socket)).toBe(true);
  return { dialog, input, button, socket };
}

test('저장 확인 전 입력을 지우지 않고 중복 전송과 실시간 에코 중복을 막는다', async ({ page }) => {
  const { input, button, socket } = await prepareOwnerChat(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requests = 0;
  const saved = { id: 'saved-message', content: '안녕하세요. 문의드립니다.', username: 'chat-user', type: 'message', timestamp: '2026-10-26T09:00:00Z' };
  await page.route('**/api/chat/messages', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    requests += 1;
    await gate;
    await route.fulfill({ json: success(saved) });
  });
  try {
    await button.evaluate(element => {
      const form = element.closest('form')!;
      form.requestSubmit();
      form.requestSubmit();
    });
    await expect.poll(() => requests).toBe(1);
    await expect(input).toHaveValue(saved.content);
    await expect(button).toBeDisabled();
    socket.send(JSON.stringify(saved));
    socket.send(JSON.stringify({ ...saved, id: 'other-room', roomId: 'another-user', content: '다른 방의 메시지' }));
    await expect(page.getByTestId('owner-message-list').getByText(saved.content)).toHaveCount(1);
    await expect(page.getByTestId('owner-message-list').getByText('다른 방의 메시지')).toHaveCount(0);
    release();
    await expect(input).toHaveValue('');
    await expect(page.getByTestId('owner-message-list').getByText(saved.content)).toHaveCount(1);
  } finally { release(); }
});

test('전송 실패를 알리고 다시 보낼 원문을 보존한다', async ({ page }) => {
  const { input, button, dialog } = await prepareOwnerChat(page);
  await page.route('**/api/chat/messages', route => route.fulfill({ status: 503, json: { message: '검증용 장애' } }));
  await button.click();
  await expect(dialog.getByRole('status')).toContainText('전송 확인을 받지 못했어요');
  await expect(input).toHaveValue('안녕하세요. 문의드립니다.');
  await expect(button).toBeEnabled();
});

test('전송 중 새로 쓴 입력은 이전 메시지의 저장 응답으로 지우지 않는다', async ({ page }) => {
  const { input, button } = await prepareOwnerChat(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/chat/messages', async route => {
    const content: string = route.request().postDataJSON().content;
    await gate;
    await route.fulfill({ json: success({ id: 'first', content, username: 'chat-user', timestamp: '2026-10-26T09:00:00Z' }) });
  });
  try {
    await button.click();
    await input.fill('다음으로 쓴 메시지');
    release();
    await expect(button).toBeEnabled();
    await expect(input).toHaveValue('다음으로 쓴 메시지');
  } finally { release(); }
});

test('같은 이름의 다른 계정으로 바뀌면 이전 연결과 대화를 격리한다', async ({ page }) => {
  await prepareAgentChat(page);
  const user = { id: 'first-user', username: 'same-name', displayName: '사용자', email: 'user@example.com', role: 'USER' as const };
  await seedSession(page, user);
  let releaseIdentity!: () => void;
  const identity = new Promise<void>(resolve => { releaseIdentity = resolve; });
  await page.route('**/api/auth/me', async route => {
    await identity;
    await route.fulfill({ json: success({ ...user, id: 'second-user' }) });
  });
  let histories = 0;
  await page.route('**/api/chat/messages*', async route => {
    if (route.request().method() !== 'GET') return route.fallback();
    histories += 1;
    await route.fulfill({ json: success(histories === 1
      ? [{ id: 'old', content: '이전 계정의 메시지', username: user.username, timestamp: '2026-10-26T09:00:00Z' }] : []) });
  });
  await page.goto('/feed?chat=open');
  await page.getByRole('tab', { name: '주인에게 남기기' }).click();
  await expect(page.getByTestId('owner-message-list').getByText('이전 계정의 메시지')).toBeVisible();
  const input = page.getByRole('textbox', { name: '블로그 주인에게 보낼 메시지' });
  await input.fill('이전 계정의 작성 중인 메시지');
  releaseIdentity();
  await expect.poll(() => histories).toBe(2);
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('owner-message-list').getByText('이전 계정의 메시지')).toHaveCount(0);
});
