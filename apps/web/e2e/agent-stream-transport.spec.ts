import { expect, test } from '@playwright/test';
import { readAgentStream } from '../src/features/chat/api/agentStreamTransport';

const response = { sessionId: 'stream-test', answer: '한글 답변', stages: [], sources: [], followUps: [] };
const packet = (name: string, payload: unknown) => `event: ${name}\r\ndata: ${JSON.stringify(payload)}\r\n\r\n`;

test('완료 이벤트를 받으면 열린 소켓을 정리하고 뒤늦은 오류를 무시한다', async () => {
  let cancelled = false;
  const original = globalThis.fetch;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(packet('complete', response) + packet('error', { message: '늦은 오류' })));
      // 소켓은 끝내지 않는다. complete만으로 호출이 끝나야 한다.
    },
    cancel() { cancelled = true; },
  });
  globalThis.fetch = async () => new Response(body);
  const events: string[] = [];
  try {
    await readAgentStream({ url: 'http://localhost/stream', body: { message: '질문', sessionId: 'stream-test' }, onEvent: event => events.push(event.type) });
    expect(events).toEqual(['complete']);
    expect(cancelled).toBe(true);
  } finally { globalThis.fetch = original; }
});

test('한글 바이트와 CRLF 구분자가 잘려 와도 답변을 복원한다', async () => {
  const original = globalThis.fetch;
  const bytes = new TextEncoder().encode(packet('delta', { delta: '한글 설명' }) + packet('complete', response));
  globalThis.fetch = async () => new Response(new ReadableStream<Uint8Array>({
    start(controller) { for (const byte of bytes) controller.enqueue(Uint8Array.of(byte)); controller.close(); },
  }));
  const events: unknown[] = [];
  try {
    await readAgentStream({ url: 'http://localhost/stream', body: { message: '질문', sessionId: 'stream-test' }, onEvent: event => events.push(event) });
    expect(events).toEqual([{ type: 'delta', delta: '한글 설명' }, { type: 'complete', response }]);
  } finally { globalThis.fetch = original; }
});

for (const [name, payload] of [
  ['완료 전 끊김', packet('delta', { delta: '중간 내용' })],
  ['잘못된 출처', packet('complete', { ...response, sources: [null] })],
  ['잘못된 단계', packet('complete', { ...response, stages: [null] })],
] as const) {
  test(`${name}: 성공으로 표시하지 않는다`, async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => new Response(payload);
    try {
      await expect(readAgentStream({ url: 'http://localhost/stream', body: { message: '질문', sessionId: 'stream-test' }, onEvent: () => {} })).rejects.toThrow();
    } finally { globalThis.fetch = original; }
  });
}
