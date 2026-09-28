import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';
import type { PageContext, PageMessage, PageStreamEvent } from '../model/pageAgentTypes';

interface StreamRequest {
  message: string;
  context: PageContext;
  conversation: PageMessage[];
  signal: AbortSignal;
  onEvent: (event: PageStreamEvent) => void;
}

function parsePacket(packet: string): PageStreamEvent | undefined {
  const lines = packet.split(/\r?\n/);
  const eventName = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
  const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
  if (!eventName || !data) return;
  let payload: unknown = JSON.parse(data);
  if (typeof payload === 'string') payload = JSON.parse(payload);
  if (!payload || typeof payload !== 'object') return;
  const value = payload as Record<string, unknown>;
  if (eventName === 'delta' && typeof value.delta === 'string') return { type: 'delta', delta: value.delta };
  if (eventName === 'stage' && typeof value.detail === 'string') return { type: 'stage', detail: value.detail };
  if (eventName === 'error') return { type: 'error', message: '답변을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  if (eventName === 'complete' && typeof value.answer === 'string') {
    const sources = Array.isArray(value.sources) ? value.sources : [];
    // 전송 계층의 id가 아니라 페이지 섹션 slug를 화면 앵커와 연결한다.
    const sourceIds = sources.flatMap(source => {
      const sectionId = typeof source?.slug === 'string' ? source.slug : source?.id;
      return typeof sectionId === 'string' ? [sectionId] : [];
    });
    return { type: 'complete', answer: value.answer, sourceIds };
  }
}

function buildConversation(messages: PageMessage[]) {
  let length = 0;
  return messages.slice(-6).reverse().flatMap(message => {
    const content = message.content.slice(0, Math.min(1200, 3600 - length));
    length += content.length;
    return content ? [{ role: message.role, content }] : [];
  }).reverse();
}

async function consumeStream(body: ReadableStream<Uint8Array>, onEvent: StreamRequest['onEvent']) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 100_000) throw new Error('응답 형식을 확인하지 못했습니다.');
      const packets = buffer.split(/\r?\n\r?\n/);
      buffer = packets.pop() ?? '';
      for (const packet of packets) {
        const event = parsePacket(packet);
        if (event) onEvent(event);
      }
      if (done) {
        if (buffer.trim()) { const event = parsePacket(buffer); if (event) onEvent(event); }
        return;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export async function streamPageAnswer(request: StreamRequest) {
  const response = await fetch(`${resolveApiBaseUrl()}/vault/agent/page/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    signal: request.signal,
    body: JSON.stringify({ message: request.message, pageContext: request.context, conversation: buildConversation(request.conversation) }),
  });
  if (response.status === 429) throw new Error('질문이 잠시 몰렸습니다. 1분 뒤 다시 시도해 주세요.');
  if (!response.ok || !response.body) throw new Error('Agent에 연결하지 못했습니다. 페이지의 근거를 직접 확인하거나 잠시 후 다시 시도해 주세요.');
  await consumeStream(response.body, request.onEvent);
}
