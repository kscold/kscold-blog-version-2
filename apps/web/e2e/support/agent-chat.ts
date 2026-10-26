import type { Page } from '@playwright/test';
import { isolateBackendApi, mockApi, mockShellApis, success } from './api';

export const chatAnswer = {
  sessionId: 'chat-ux-session', answer: '답변을 받았습니다.', stages: [], sources: [], followUps: [],
};
export const agentPacket = (name: string, value: unknown) => `event: ${name}\ndata: ${JSON.stringify(value)}\n\n`;

export async function prepareAgentChat(page: Page) {
  await isolateBackendApi(page);
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/auth/me', success(null));
  await mockApi(page, 'GET', '**/api/vault/agent/content-scope', success({ label: '공개 기록', description: '공개 기록을 검색합니다.' }));
  await mockApi(page, 'GET', '**/api/vault/agent/history*', success({ sessionId: chatAnswer.sessionId, messages: [] }));
}
