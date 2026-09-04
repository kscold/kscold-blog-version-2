import { expect, test } from '@playwright/test';
import { emptyPage, mockApi, mockShellApis, success } from './support/api';

const LONG_ANSWER = Array.from(
  { length: 36 },
  (_, index) => `${index + 1}번째 확인 항목입니다. Agent가 찾은 기록을 차례대로 설명합니다.`
).join('\n\n');

test('이전 대화를 불러온 뒤 긴 Agent 답변의 마지막까지 자동으로 따라간다', async ({ page }) => {
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/auth/me', success(null));
  await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage(12)));
  await mockApi(
    page,
    'GET',
    '**/api/vault/agent/content-scope',
    success({ label: '공개 기록', description: '공개된 기록을 검색합니다.' })
  );
  let releaseHistory!: () => void;
  const historyGate = new Promise<void>(resolve => {
    releaseHistory = resolve;
  });
  await page.route('**/api/vault/agent/history*', async route => {
    await historyGate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success({ sessionId: 'agent-e2e', messages: [] })),
    });
  });
  await page.route('**/api/vault/agent/chat/stream', async route => {
    const complete = {
      sessionId: 'agent-e2e',
      answer: LONG_ANSWER,
      stages: [{ name: '답변 완료', detail: '관련 기록을 정리했습니다.' }],
      sources: [],
      followUps: [],
    };
    const body = [
      `event: stage\ndata: ${JSON.stringify({ name: '검색', detail: '기록을 찾았습니다.' })}`,
      `event: complete\ndata: ${JSON.stringify(complete)}`,
      '',
    ].join('\n\n');
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body });
  });

  await page.goto('/feed');
  await page.getByRole('button', { name: 'KSCOLD 대화 열기' }).click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' });
  const submit = dialog.getByRole('button', { name: 'Agent에게 질문 보내기' });

  await input.fill('긴 답변으로 기록을 설명해줘');
  await expect(submit).toBeDisabled();
  releaseHistory();
  await expect(submit).toBeEnabled();
  await submit.click();

  const lastSentence = dialog.getByText(
    '36번째 확인 항목입니다. Agent가 찾은 기록을 차례대로 설명합니다.'
  );
  await expect(lastSentence).toBeVisible();
  await expect(lastSentence).toBeInViewport();
  await expect
    .poll(() =>
      dialog.locator('[data-cy="agent-message-list"]').evaluate(element => element.scrollTop)
    )
    .toBeGreaterThan(0);
});
