import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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
  lastMessage?: string;
  lastTimestamp?: string;
}

export function useChatAdmin() {
  const [rooms, setRooms] = useState<Map<string, AdminRoom>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;

  // REST: 과거 채팅 방 목록 불러오기
  const loadRooms = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data as Array<{
        roomId: string; username: string; lastMessage: string;
        lastTimestamp: string; messageCount: number;
      }>;
      setRooms(prev => {
        const next = new Map(prev);
        data.forEach(r => {
          const existing = next.get(r.roomId);
          next.set(r.roomId, {
            userId: r.roomId,
            username: existing?.username || r.username,
            online: existing?.online ?? false,
            messages: existing?.messages ?? [],
            unreadCount: existing?.unreadCount ?? 0,
            lastMessage: r.lastMessage,
            lastTimestamp: r.lastTimestamp,
          });
        });
        return next;
      });
    } catch { /* ignore */ }
  }, []);

  // REST: 방 선택 시 메시지 히스토리 불러오기
  const loadRoomMessages = useCallback(async (roomId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/chat/rooms/${roomId}/messages?size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const messages: AdminMessage[] = (json.data?.content || []).map((m: Record<string, unknown>) => ({
        id: (m.id as string) || String(Date.now()),
        username: (m.username as string) || '',
        content: (m.content as string) || '',
        fromAdmin: Boolean(m.fromAdmin),
        type: m.type === 'SYSTEM' ? 'system' as const : 'message' as const,
        timestamp: (m.timestamp as string) || '',
        roomId: (m.roomId as string) || roomId,
      }));
      setRooms(prev => {
        const next = new Map(prev);
        const room = next.get(roomId);
        if (room) next.set(roomId, { ...room, messages });
        return next;
      });
    } catch { /* ignore */ }
  }, []);

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
          // 온라인 상태만 업데이트 (REST로 로드한 기존 방 목록 보존)
          const onlineIds = new Set(
            (data.rooms as Array<{ userId: string }>).map(r => r.userId)
          );
          setRooms(() => {
            // roomsRef.current로 최신 상태 참조 (React 비동기 state 문제 우회)
            const next = new Map(roomsRef.current);
            next.forEach((room, id) => {
              next.set(id, { ...room, online: onlineIds.has(id) });
            });
            (data.rooms as Array<{ userId: string; username: string }>).forEach(r => {
              if (!next.has(r.userId)) {
                next.set(r.userId, {
                  userId: r.userId, username: r.username, online: true,
                  messages: [], unreadCount: 0,
                });
              }
            });
            return next;
          });
        } else if (data.type === 'room_joined') {
          setRooms(prev => {
            const next = new Map(prev);
            const existing = next.get(data.userId as string);
            next.set(data.userId as string, {
              userId: data.userId as string,
              username: (data.username as string) || existing?.username || '',
              online: true,
              messages: existing?.messages ?? [],
              unreadCount: existing?.unreadCount ?? 0,
              lastMessage: existing?.lastMessage,
              lastTimestamp: existing?.lastTimestamp,
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
          if (!msg.roomId) return;

          setRooms(prev => {
            const next = new Map(prev);
            const room = next.get(msg.roomId);
            const isSelected = selectedRoomIdRef.current === msg.roomId;
            if (room) {
              next.set(msg.roomId, {
                ...room,
                messages: [...room.messages, msg],
                lastMessage: msg.content,
                lastTimestamp: msg.timestamp,
                unreadCount: isSelected ? 0 : room.unreadCount + 1,
              });
            } else {
              next.set(msg.roomId, {
                userId: msg.roomId, username: msg.username, online: true,
                messages: [msg], lastMessage: msg.content,
                lastTimestamp: msg.timestamp, unreadCount: 1,
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
    // REST로 방 목록 먼저 로드 후 WebSocket 연결
    loadRooms().then(() => connect());
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, loadRooms]);

  const sendMessage = useCallback(async (content: string, toUserId: string) => {
    if (!content.trim()) return;

    // WebSocket이 열려있으면 실시간 전송
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: content.trim(), toUserId }));
    } else {
      // 오프라인이거나 WS 끊겼을 때 REST API로 저장
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        await fetch(`${API_BASE}/api/admin/chat/rooms/${toUserId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: content.trim(), username: '관리자' }),
        });
      } catch { /* ignore */ }
    }

    // 로컬 메시지 목록에 즉시 반영
    const msg: AdminMessage = {
      id: String(Date.now()),
      username: '관리자',
      content: content.trim(),
      fromAdmin: true,
      type: 'message',
      timestamp: new Date().toISOString(),
      roomId: toUserId,
    };
    setRooms(prev => {
      const next = new Map(prev);
      const room = next.get(toUserId);
      if (room) {
        next.set(toUserId, { ...room, messages: [...room.messages, msg], lastMessage: msg.content, lastTimestamp: msg.timestamp });
      }
      return next;
    });
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
    loadRoomMessages(userId);
  }, [loadRoomMessages]);

  return { rooms, isConnected, selectedRoomId, selectRoom, sendMessage };
}
