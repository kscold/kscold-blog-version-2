import type { VaultAgentChatResponse, VaultAgentSource, VaultAgentStage, VaultAgentStreamEvent } from './vaultAgentApi';

interface Request {
  url: string;
  body: { message: string; activeFolderName?: string; sessionId: string };
  onEvent: (event: VaultAgentStreamEvent) => void;
  signal?: AbortSignal;
}

// 응답이 계속 오는 동안에는 유지하고, 연결 또는 수신이 멈췄을 때만 정리한다.
const IDLE_TIMEOUT_MS = 65_000;

export async function readAgentStream({ url, body, onEvent, signal }: Request) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  let timer: ReturnType<typeof setTimeout>;
  const refreshDeadline = () => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(new Error('응답이 오래 멈춰 연결을 종료했어요. 다시 시도해 주세요.')), IDLE_TIMEOUT_MS);
  };
  refreshDeadline();
  try {
    const response = await fetch(url, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    if (!response.ok || !response.body) throw new Error(await readStreamError(response));
    await consumeStream(response.body, event => {
      refreshDeadline();
      onEvent(event);
    });
  } finally {
    clearTimeout(timer!);
    signal?.removeEventListener('abort', abort);
  }
}

async function consumeStream(body: ReadableStream<Uint8Array>, onEvent: Request['onEvent']) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let separator = buffer.match(/\r?\n\r?\n/);
      while (separator?.index !== undefined) {
        const packet = buffer.slice(0, separator.index);
        buffer = buffer.slice(separator.index + separator[0].length);
        if (consumePacket(packet, onEvent)) return;
        separator = buffer.match(/\r?\n\r?\n/);
      }
      if (done) {
        if (buffer.trim() && consumePacket(buffer, onEvent)) return;
        throw new Error('Agent 응답이 끝까지 전달되지 않았습니다.');
      }
    }
  } finally {
    // complete는 응답의 끝이다. 서버의 소켓 종료를 기다리거나 뒤늦은 이벤트를 반영하지 않는다.
    void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

function consumePacket(packet: string, onEvent: Request['onEvent']): boolean {
  const lines = packet.split(/\r?\n/);
  const name = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
  const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
  if (!name || !data) return false;
  const payload = parsePayload(data);
  if (name === 'stage' && isStage(payload)) onEvent({ type: 'stage', stage: payload });
  if (name === 'delta' && isRecord(payload) && typeof payload.delta === 'string') {
    onEvent({ type: 'delta', delta: payload.delta });
  }
  if (name === 'complete') {
    if (!isChatResponse(payload)) throw new Error('Agent 답변 형식을 확인하지 못했어요. 다시 시도해 주세요.');
    onEvent({ type: 'complete', response: payload });
    return true;
  }
  if (name === 'error') {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message.slice(0, 240) : '응답을 만들지 못했습니다.';
    onEvent({ type: 'error', message });
    throw new Error(message);
  }
  return false;
}

function parsePayload(raw: string): unknown {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'string') {
      try { return JSON.parse(parsed) as unknown; } catch { return parsed; }
    }
    return parsed;
  } catch { return raw; }
}

async function readStreamError(response: Response): Promise<string> {
  if (response.status === 429) return '요청이 많아 잠시 쉬고 있어요. 조금 뒤 다시 보내 주세요.';
  if (response.status === 401 || response.status === 403) return '접근 권한이 바뀌었어요. 로그인 상태를 확인해 주세요.';
  const fallback = 'Agent 응답 연결을 시작하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
  const payload = parsePayload(await response.text().catch(() => ''));
  const message = typeof payload === 'string' ? payload
    : isRecord(payload) && typeof payload.message === 'string' ? payload.message
    : isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string'
      ? payload.error.message : '';
  return message.trim() && !message.trim().startsWith('<') ? message.trim().slice(0, 240) : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStage(value: unknown): value is VaultAgentStage {
  return isRecord(value) && typeof value.name === 'string' && typeof value.detail === 'string';
}

function isSource(value: unknown): value is VaultAgentSource {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    typeof value.slug === 'string' && typeof value.score === 'number' &&
    ['path', 'type', 'excerpt'].every(key => value[key] === undefined || typeof value[key] === 'string');
}

function isChatResponse(value: unknown): value is VaultAgentChatResponse {
  return isRecord(value) && typeof value.answer === 'string' && typeof value.sessionId === 'string' &&
    Array.isArray(value.stages) && value.stages.every(isStage) &&
    Array.isArray(value.sources) && value.sources.every(isSource) &&
    Array.isArray(value.followUps) && value.followUps.every(item => typeof item === 'string');
}
