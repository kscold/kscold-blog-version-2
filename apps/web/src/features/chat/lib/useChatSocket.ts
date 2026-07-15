import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { RawChatPayload } from '@/entities/chat';
import { toVisitorMessage } from '@/entities/chat';
import { fetchMyChatMessages, sendVisitorMessage, type VisitorChatMessage } from '@/entities/chat';
import apiClient from '@/shared/api/api-client';
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
  const shouldReconnectRef = useRef(false);

  const connect = useCallback(async () => {
    if (!shouldReconnectRef.current || wsRef.current) return;

    const token = await apiClient.getValidToken();
    if (!token || !shouldReconnectRef.current || wsRef.current) return;

    const ws = new WebSocket(`${resolveChatWsUrl()}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = event => handleSocketMessage(event, setMessages);
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      if (shouldReconnectRef.current) {
        reconnectRef.current = setTimeout(() => void connect(), 3000);
      }
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let isActive = true;
    shouldReconnectRef.current = true;

    const initializeChat = async () => {
      try {
        const chatMessages = await fetchMyChatMessages();
        if (isActive) {
          setMessages(chatMessages);
        }
      } catch {
        if (isActive) {
          setMessages([]);
        }
      }

      if (isActive) {
        void connect();
      }
    };

    void initializeChat();

    return () => {
      isActive = false;
      shouldReconnectRef.current = false;
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
    const data = JSON.parse(event.data as string) as RawChatPayload & {
      messages?: RawChatPayload[];
    };
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
