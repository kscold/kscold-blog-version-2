import { toVisitorMessage, type RawChatPayload, type VisitorChatMessage } from '@/entities/chat';
import { resolveChatWsUrl } from '@/shared/lib/runtime-url';

export function mergeChatMessages(previous: VisitorChatMessage[], incoming: VisitorChatMessage[]) {
  const messages = new Map(previous.map(message => [message.id, message]));
  incoming.forEach(message => messages.set(message.id, message));
  return [...messages.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

interface Handlers {
  viewerId: string;
  onMessages: (messages: VisitorChatMessage[]) => void;
  onConnection: (connected: boolean) => void;
}

export function subscribeVisitorChat({ viewerId, onMessages, onConnection }: Handlers) {
  let active = true;
  let socket: WebSocket | undefined;
  let reconnect: ReturnType<typeof setTimeout> | undefined;
  const connect = () => {
    if (!active) return;
    const ws = new WebSocket(resolveChatWsUrl());
    socket = ws;
    ws.onopen = () => { if (active) onConnection(true); };
    ws.onmessage = event => {
      if (!active) return;
      const messages = parseMessages(event.data, viewerId);
      if (messages.length) onMessages(messages);
    };
    ws.onclose = () => {
      if (!active) return;
      onConnection(false);
      reconnect = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  };
  connect();
  return () => {
    active = false;
    clearTimeout(reconnect);
    if (!socket) return;
    socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
    socket.close();
  };
}

function parseMessages(raw: unknown, viewerId: string): VisitorChatMessage[] {
  try {
    if (typeof raw !== 'string') return [];
    const data = JSON.parse(raw) as RawChatPayload & { messages?: RawChatPayload[] };
    const messages = data?.type === 'history' && Array.isArray(data.messages) ? data.messages
      : data?.type === 'message' || data?.type === 'system' ? [data] : [];
    return messages.filter(message => message && (!message.roomId || message.roomId === viewerId) && typeof message.id === 'string' &&
      typeof message.content === 'string').map(toVisitorMessage);
  } catch { return []; }
}
