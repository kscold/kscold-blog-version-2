import { useState, useEffect, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  user: {
    id: string | null;
    name: string;
  };
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
}

interface UseChatSocketOptions {
  isOpen: boolean;
  username: string;
}

export function useChatSocket({ isOpen, username }: UseChatSocketOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const WS_URL =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? `wss://${window.location.host}/ws/chat`
        : 'ws://localhost:8081/ws/chat');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === 'history') {
          const historyMessages: Message[] = (data.messages as Array<{
            type: string;
            id: string;
            username: string;
            content: string;
            timestamp: string;
          }>).map(msg => toMessage(msg));
          setMessages(historyMessages);
        } else if (data.type === 'user_count') {
          setOnlineUsers(data.count as number);
        } else if (data.type === 'message' || data.type === 'system') {
          const msg = toMessage(data as {
            type: string;
            id: string;
            username: string;
            content: string;
            timestamp: string;
          });
          setMessages(prev => [...prev, msg]);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      // 3초 후 재연결 시도
      reconnectTimerRef.current = setTimeout(() => {
        if (wsRef.current === null) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // 재연결 방지
        wsRef.current.close();
        wsRef.current = null;
      }
      setMessages([]);
      setIsConnected(false);
      setOnlineUsers(0);
    };
  }, [isOpen, connect]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(JSON.stringify({ type: 'message', content: content.trim() }));
    },
    []
  );

  return { messages, isConnected, onlineUsers, sendMessage };
}

function toMessage(data: {
  type: string;
  id: string;
  username: string;
  content: string;
  timestamp: string;
}): Message {
  const isSystem = data.type === 'system';
  return {
    id: data.id || String(Date.now()),
    user: {
      id: null,
      name: isSystem ? 'SYSTEM' : (data.username || '익명'),
    },
    content: data.content || '',
    type: isSystem ? 'SYSTEM' : 'TEXT',
    createdAt: data.timestamp || new Date().toISOString(),
  };
}
