import { expect, test } from '@playwright/test';
import { seedSession } from './support/auth';
import { mockApi, mockShellApis, success } from './support/api';

test('채팅 WebSocket 주소에 인증 토큰을 노출하지 않는다', async ({ page }) => {
  await page.addInitScript(() => {
    const socketUrls: string[] = [];
    Object.defineProperty(window, '__chatSocketUrls', { value: socketUrls });
    const NativeWebSocket = window.WebSocket;
    const TrackingWebSocket = new Proxy(NativeWebSocket, {
      construct(Target, argumentsList) {
        const url = String(argumentsList[0]);
        if (new URL(url, window.location.href).pathname.endsWith('/api/ws/chat')) {
          socketUrls.push(url);
        }
        return Reflect.construct(Target, argumentsList);
      },
    });
    Object.defineProperty(window, 'WebSocket', { value: TrackingWebSocket });
  });
  await seedSession(page, {
    id: 'chat-user',
    email: 'chat@example.com',
    username: 'chat-user',
    displayName: '채팅 사용자',
    role: 'USER',
  });
  await mockShellApis(page);
  await mockApi(
    page,
    'GET',
    '**/api/vault/agent/content-scope',
    success({ label: '공개 기록', description: '공개 기록을 검색합니다.' })
  );
  await mockApi(
    page,
    'GET',
    '**/api/vault/agent/history*',
    success({ sessionId: 'chat-security-session', messages: [] })
  );
  await mockApi(page, 'GET', '**/api/chat/messages*', success([]));
  await mockApi(page, 'POST', '**/api/analytics/page-visit', success(null));

  await page.goto('/?chat=open');
  await page.getByRole('tab', { name: '주인에게 남기기' }).click();

  const readSocketUrl = () =>
    page.evaluate(() => {
      const target = window as typeof window & { __chatSocketUrls?: string[] };
      return target.__chatSocketUrls?.at(0) || '';
    });
  await expect.poll(readSocketUrl).not.toBe('');
  const socketUrl = await readSocketUrl();
  expect(socketUrl).not.toContain('?token=');
});
