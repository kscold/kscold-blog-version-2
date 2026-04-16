import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { RawChatPayload } from '@/entities/chat/lib/messageMappers';
import { toVisitorMessage } from '@/entities/chat/lib/messageMappers';
import { fetchMyChatMessages, sendVisitorMessage, type VisitorChatMessage } from '@/entities/chat';
import { getAccessToken } from '@/shared/lib/authTokenStorage';
import { resolveChatWsUrl } from '@/shared/lib/runtime-url';

interface UseChatSocketOptions {
  isOpen: boolean;
  username: string;
}

export function useChatSocket({ isOpen, username: _username }: UseChatSocketOptions) {
  const [messages, setMessages] = useState<VisitorChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;
    const ws = new WebSocket(`${resolveChatWsUrl()}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = event => handleSocketMessage(event, setMessages);
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      reconnectRef.current = setTimeout(() => !wsRef.current && connect(), 3000);
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchMyChatMessages().then(setMessages).catch(() => {});
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setMessages([]);
      setIsConnected(false);
    };
  }, [connect, isOpen]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: content.trim() }));
      return;
    }
    const saved = await sendVisitorMessage(content.trim());
    setMessages(prev => [...prev, saved]);
  }, []);

  return { messages, isConnected, sendMessage };
}

function handleSocketMessage(
  event: MessageEvent,
  setMessages: Dispatch<SetStateAction<VisitorChatMessage[]>>
) {
  try {
    const data = JSON.parse(event.data as string) as RawChatPayload & { messages?: RawChatPayload[] };
    if (data.type === 'history') {
      setMessages((data.messages || []).map(toVisitorMessage));
      return;
    }
    if (data.type === 'message' || data.type === 'system') {
      setMessages(prev => [...prev, toVisitorMessage(data)]);
    }
  } catch {
    // 의도적으로 무시
  }
}
