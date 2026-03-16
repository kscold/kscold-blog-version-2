import { useState, useEffect, useCallback, useRef } from 'react';

export interface AdminMessage {
  id: string;
  username: string;
  content: string;
  fromAdmin: boolean;
  type: 'message' | 'system';
  timestamp: string;
  roomId: string;
}

export interface AdminRoom {
  userId: string;
  username: string;
  online: boolean;
  messages: AdminMessage[];
  unreadCount: number;
}

export function useChatAdmin() {
  const [rooms, setRooms] = useState<Map<string, AdminRoom>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const base =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? `wss://${window.location.host}/ws/chat`
        : 'ws://localhost:8081/ws/chat');

    const ws = new WebSocket(`${base}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === 'room_list') {
          setRooms(() => {
            const map = new Map<string, AdminRoom>();
            (data.rooms as Array<{ userId: string; username: string; online: boolean }>).forEach(r => {
              map.set(r.userId, {
                userId: r.userId,
                username: r.username,
                online: r.online,
                messages: [],
                unreadCount: 0,
              });
            });
            return map;
          });
        } else if (data.type === 'room_joined') {
          setRooms(prev => {
            const next = new Map(prev);
            const existing = next.get(data.userId as string);
            next.set(data.userId as string, {
              userId: data.userId as string,
              username: data.username as string,
              online: true,
              messages: existing?.messages ?? [],
              unreadCount: existing?.unreadCount ?? 0,
            });
            return next;
          });
        } else if (data.type === 'room_left') {
          setRooms(prev => {
            const next = new Map(prev);
            const room = next.get(data.userId as string);
            if (room) next.set(data.userId as string, { ...room, online: false });
            return next;
          });
        } else if (data.type === 'message' || data.type === 'system') {
          const msg: AdminMessage = {
            id: (data.id as string) || String(Date.now()),
            username: (data.username as string) || '',
            content: (data.content as string) || '',
            fromAdmin: Boolean(data.fromAdmin),
            type: data.type as 'message' | 'system',
            timestamp: (data.timestamp as string) || new Date().toISOString(),
            roomId: (data.roomId as string) || '',
          };
          const roomId = msg.roomId;
          if (!roomId) return;

          setRooms(prev => {
            const next = new Map(prev);
            const room = next.get(roomId);
            const isSelected = selectedRoomIdRef.current === roomId;
            if (room) {
              next.set(roomId, {
                ...room,
                messages: [...room.messages, msg],
                unreadCount: isSelected ? 0 : room.unreadCount + 1,
              });
            }
            return next;
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      reconnectTimerRef.current = setTimeout(() => {
        if (wsRef.current === null) connect();
      }, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string, toUserId: string) => {
    if (!content.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'message', content: content.trim(), toUserId }));
  }, []);

  const selectRoom = useCallback((userId: string) => {
    selectedRoomIdRef.current = userId;
    setSelectedRoomId(userId);
    setRooms(prev => {
      const next = new Map(prev);
      const room = next.get(userId);
      if (room) next.set(userId, { ...room, unreadCount: 0 });
      return next;
    });
  }, []);

  return { rooms, isConnected, selectedRoomId, selectRoom, sendMessage };
}
