import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminMessage, AdminRoom } from '@/entities/chat';
import { fetchChatRooms, fetchRoomMessages, sendRestMessage } from '@/entities/chat';

type Rooms = Map<string, AdminRoom>;

// Map 업데이트 헬퍼
function updateRoom(prev: Rooms, id: string, patch: Partial<AdminRoom>): Rooms {
  const next = new Map(prev);
  const room = next.get(id);
  if (room) next.set(id, { ...room, ...patch });
  return next;
}

export function useChatAdmin() {
  const [rooms, setRooms] = useState<Rooms>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef<string | null>(null);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;

  // REST: 과거 채팅 방 목록
  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchChatRooms();
      setRooms(prev => {
        const next = new Map(prev);
        data.forEach(r => {
          const existing = next.get(r.roomId);
          next.set(r.roomId, {
            userId: r.roomId, username: existing?.username || r.username,
            online: existing?.online ?? false, messages: existing?.messages ?? [],
            unreadCount: existing?.unreadCount ?? 0,
            lastMessage: r.lastMessage, lastTimestamp: r.lastTimestamp,
          });
        });
        return next;
      });
    } catch { /* 무시 */ }
  }, []);

  // REST: 방 메시지 히스토리
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const messages = await fetchRoomMessages(roomId);
      setRooms(prev => updateRoom(prev, roomId, { messages }));
    } catch { /* 무시 */ }
  }, []);

  // WebSocket 메시지 핸들러
  const handleWsMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string);
      if (data.type === 'room_list') {
        const onlineIds = new Set((data.rooms as Array<{ userId: string }>).map(r => r.userId));
        setRooms(() => {
          const next = new Map(roomsRef.current);
          next.forEach((room, id) => next.set(id, { ...room, online: onlineIds.has(id) }));
          (data.rooms as Array<{ userId: string; username: string }>).forEach(r => {
            if (!next.has(r.userId))
              next.set(r.userId, { userId: r.userId, username: r.username, online: true, messages: [], unreadCount: 0 });
          });
          return next;
        });
      } else if (data.type === 'room_joined') {
        setRooms(prev => {
          const next = new Map(prev);
          const existing = next.get(data.userId);
          next.set(data.userId, {
            userId: data.userId, username: data.username || existing?.username || '', online: true,
            messages: existing?.messages ?? [], unreadCount: existing?.unreadCount ?? 0,
            lastMessage: existing?.lastMessage, lastTimestamp: existing?.lastTimestamp,
          });
          return next;
        });
      } else if (data.type === 'room_left') {
        setRooms(prev => updateRoom(prev, data.userId, { online: false }));
      } else if (data.type === 'message' || data.type === 'system') {
        const msg: AdminMessage = {
          id: data.id || String(Date.now()), username: data.username || '',
          content: data.content || '', fromAdmin: Boolean(data.fromAdmin),
          type: data.type, timestamp: data.timestamp || new Date().toISOString(),
          roomId: data.roomId || '',
        };
        if (!msg.roomId) return;
        setRooms(prev => {
          const next = new Map(prev);
          const room = next.get(msg.roomId);
          const isSelected = selectedRef.current === msg.roomId;
          if (room) {
            next.set(msg.roomId, { ...room, messages: [...room.messages, msg],
              lastMessage: msg.content, lastTimestamp: msg.timestamp,
              unreadCount: isSelected ? 0 : room.unreadCount + 1 });
          } else {
            next.set(msg.roomId, { userId: msg.roomId, username: msg.username, online: true,
              messages: [msg], lastMessage: msg.content, lastTimestamp: msg.timestamp, unreadCount: 1 });
          }
          return next;
        });
      }
    } catch { /* 무시 */ }
  }, []);

  // WebSocket 연결
  const connect = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    const base = process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? `wss://${window.location.host}/ws/chat` : 'ws://localhost:8081/ws/chat');

    const ws = new WebSocket(`${base}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = handleWsMessage;
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      reconnectRef.current = setTimeout(() => { if (!wsRef.current) connect(); }, 3000);
    };
    ws.onerror = () => ws.close();
  }, [handleWsMessage]);

  useEffect(() => {
    loadRooms().then(() => connect());
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); wsRef.current = null; }
    };
  }, [connect, loadRooms]);

  const sendMessage = useCallback(async (content: string, toUserId: string) => {
    if (!content.trim()) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: content.trim(), toUserId }));
    } else {
      try {
        await sendRestMessage(toUserId, content.trim());
        const msg: AdminMessage = {
          id: String(Date.now()), username: '관리자', content: content.trim(),
          fromAdmin: true, type: 'message', timestamp: new Date().toISOString(), roomId: toUserId,
        };
        setRooms(prev => {
          const room = prev.get(toUserId);
          if (!room) return prev;
          return updateRoom(prev, toUserId, { messages: [...room.messages, msg], lastMessage: msg.content });
        });
      } catch { /* 무시 */ }
    }
  }, []);

  const selectRoom = useCallback((userId: string) => {
    selectedRef.current = userId;
    setSelectedRoomId(userId);
    setRooms(prev => updateRoom(prev, userId, { unreadCount: 0 }));
    loadMessages(userId);
  }, [loadMessages]);

  return { rooms, isConnected, selectedRoomId, selectRoom, sendMessage };
}
