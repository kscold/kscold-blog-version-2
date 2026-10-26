import { expect, test } from '@playwright/test';
import { isolateBackendApi, mockApi, mockShellApis, success } from './support/api';

function responseGate() {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  return { ready, release };
}

for (const first of ['history', 'scope'] as const) {
  test(`${first} 응답이 먼저 와도 이전 Agent 답변을 안내 문구로 덮지 않는다`, async ({ page }) => {
    await isolateBackendApi(page);
    await mockShellApis(page);
    await mockApi(page, 'GET', '**/api/auth/me', success(null));
    const history = responseGate();
    const scope = responseGate();
    await page.route('**/api/vault/agent/content-scope', async route => {
      await scope.ready;
      await route.fulfill({ json: success({ label: '검증된 검색 범위', description: '검색 범위 안내입니다.' }) });
    });
    await page.route('**/api/vault/agent/history*', async route => {
      await history.ready;
      await route.fulfill({ json: success({
        sessionId: 'ordered-history',
        messages: [{ id: 'saved-assistant', role: 'assistant', content: '이전에 저장된 Agent 답변입니다.', stages: [], sources: [] }],
      }) });
    });
    try {
      await page.goto('/feed?chat=open');
      const dialog = page.getByRole('dialog');
      if (first === 'history') {
        history.release();
        await expect(dialog.getByText('이전에 저장된 Agent 답변입니다.')).toBeVisible();
        scope.release();
      } else {
        scope.release();
        await expect(dialog.getByText('검증된 검색 범위', { exact: true })).toBeVisible();
        history.release();
      }
      await expect(dialog.getByText('검증된 검색 범위', { exact: true })).toBeVisible();
      await expect(dialog.getByText('이전에 저장된 Agent 답변입니다.')).toBeVisible();
      await expect(dialog.getByText(/안녕하세요\. KSCOLD Agent예요/)).toHaveCount(0);
    } finally {
      history.release();
      scope.release();
    }
  });
}
