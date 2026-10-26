import { expect, test } from '@playwright/test';
import { success } from './support/api';
import { agentPacket, chatAnswer, prepareAgentChat } from './support/agent-chat';
import { seedSession } from './support/auth';

test('대화 복원 실패를 알리고 입력을 보존한 채 다시 불러온다', async ({ page }) => {
  await prepareAgentChat(page);
  let requests = 0;
  await page.route('**/api/vault/agent/history*', async route => {
    requests += 1;
    await route.fulfill(requests === 1 ? { status: 503, json: { message: '일시 오류' } } : { json: success({
      sessionId: chatAnswer.sessionId, messages: [{ id: 'saved', role: 'assistant', content: '저장된 답변입니다.', stages: [], sources: [] }],
    }) });
  });
  await page.goto('/feed?chat=open');
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' });
  await input.fill('작성하던 다음 질문');
  await expect(dialog.getByRole('status')).toContainText('이전 대화를 불러오지 못했어요');
  await expect(dialog.getByRole('button', { name: 'Agent에게 질문 보내기' })).toBeDisabled();
  await dialog.getByRole('button', { name: '대화 기록 다시 불러오기' }).click();
  await expect(dialog.getByText('저장된 답변입니다.')).toBeVisible();
  await expect(input).toHaveValue('작성하던 다음 질문');
  await expect(dialog.getByRole('button', { name: 'Agent에게 질문 보내기' })).toBeEnabled();
  await expect(dialog.getByRole('button', { name: '새 채팅 시작' })).toBeEnabled();
});

test('브라우저 저장소가 차단돼도 새 대화를 유지하며 두 번 전송한다', async ({ page }) => {
  await prepareAgentChat(page);
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) { if (key === 'kscold-agent-chat-session-id') throw new DOMException('blocked', 'SecurityError'); return get.call(this, key); };
    Storage.prototype.setItem = function (key, value) { if (key === 'kscold-agent-chat-session-id') throw new DOMException('blocked', 'SecurityError'); return set.call(this, key, value); };
  });
  const sessions: string[] = [];
  await page.route('**/api/vault/agent/chat/stream', async route => {
    sessions.push(route.request().postDataJSON().sessionId);
    await route.fulfill({ contentType: 'text/event-stream', body: agentPacket('complete', chatAnswer) });
  });
  await page.goto('/feed?chat=open');
  const dialog = page.getByRole('dialog');
  for (const question of ['첫 번째 질문', '두 번째 질문']) {
    await dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' }).fill(question);
    await dialog.getByRole('button', { name: 'Agent에게 질문 보내기' }).click();
    await expect(dialog.getByRole('button', { name: 'Agent 답변 수신 중단' })).toHaveCount(0);
  }
  expect(sessions).toEqual([chatAnswer.sessionId, chatAnswer.sessionId]);
});

test('한글 조합 Enter는 보내지 않고 Shift+Enter 줄바꿈과 Enter 전송을 구분한다', async ({ page }) => {
  await prepareAgentChat(page);
  const questions: string[] = [];
  await page.route('**/api/vault/agent/chat/stream', async route => {
    questions.push(route.request().postDataJSON().message);
    await route.fulfill({ contentType: 'text/event-stream', body: agentPacket('complete', chatAnswer) });
  });
  await page.goto('/feed?chat=open');
  const input = page.getByRole('textbox', { name: 'Agent에게 보낼 질문' });
  await input.fill('한글 조합');
  await expect(page.getByRole('button', { name: 'Agent에게 질문 보내기' })).toBeEnabled();
  await input.dispatchEvent('compositionstart');
  await input.press('Enter');
  expect(questions).toHaveLength(0);
  await input.dispatchEvent('compositionend');
  await input.fill('첫 줄');
  await input.press('Shift+Enter');
  await input.pressSequentially('둘째 줄');
  await expect(input).toHaveValue('첫 줄\n둘째 줄');
  await input.press('Enter');
  await expect(page.getByText(chatAnswer.answer, { exact: true })).toBeVisible();
  expect(questions).toEqual(['첫 줄\n둘째 줄']);
});

test('채팅 안에서 키보드 초점을 유지하고 닫으면 열기 버튼으로 돌아간다', async ({ page }) => {
  await prepareAgentChat(page);
  await page.goto('/feed');
  const trigger = page.getByRole('button', { name: 'KSCOLD 대화 열기' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('같은 계정의 관리자 권한이 해제돼도 새 세션으로 바꾸고 기존 답변을 지운다', async ({ page }) => {
  await prepareAgentChat(page);
  const user = { id: 'role-viewer', username: 'viewer', displayName: '검증 사용자', email: 'viewer@example.com', role: 'ADMIN' as const };
  await seedSession(page, user);
  let release!: () => void;
  let changed = false;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/auth/me', async route => {
    await gate;
    await route.fulfill({ json: success({ ...user, role: 'USER' }) });
  });
  const sessions: string[] = [];
  await page.route('**/api/vault/agent/history*', async route => {
    const sessionId = new URL(route.request().url()).searchParams.get('sessionId')!;
    sessions.push(sessionId);
    await route.fulfill({ json: success({ sessionId, messages: changed ? [] : [
      { id: 'admin-answer', role: 'assistant', content: '관리자 권한의 이전 답변', stages: [], sources: [] },
    ] }) });
  });
  await page.goto('/feed?chat=open');
  await expect(page.getByRole('dialog').getByText('관리자 권한의 이전 답변')).toBeVisible();
  const previous = sessions.at(-1);
  changed = true;
  release();
  await expect(page.getByRole('dialog').getByText('관리자 권한의 이전 답변')).toHaveCount(0);
  await expect.poll(() => sessions.at(-1)).not.toBe(previous);
});
