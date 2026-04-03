import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { applyAdminSocketEvent, mergeRestRooms, patchRoom, type Rooms } from '@/entities/chat/lib/adminRoomState';
import type { AdminMessage } from '@/entities/chat';
import { fetchChatRooms, fetchRoomMessages, sendRestMessage } from '@/entities/chat';
import { getAccessToken } from '@/shared/lib/authTokenStorage';
import { resolveChatWsUrl } from '@/shared/lib/runtime-url';

export function useChatAdmin() {
  const [rooms, setRooms] = useState<Rooms>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchChatRooms();
      setRooms(prev => mergeRestRooms(prev, data));
    } catch {
      // noop
    }
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const messages = await fetchRoomMessages(roomId);
      setRooms(prev => patchRoom(prev, roomId, { messages }));
    } catch {
      // noop
    }
  }, []);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;
    const ws = new WebSocket(`${resolveChatWsUrl()}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = event => handleSocketMessage(event, selectedRef.current, setRooms);
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      reconnectRef.current = setTimeout(() => !wsRef.current && connect(), 3000);
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    loadRooms().then(connect);
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, loadRooms]);

  const sendMessage = useCallback(async (content: string, roomId: string) => {
    if (!content.trim()) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: content.trim(), toUserId: roomId }));
      return;
    }
    await sendRestMessage(roomId, content.trim());
    appendRestAdminMessage(setRooms, roomId, content.trim());
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    selectedRef.current = roomId;
    setSelectedRoomId(roomId);
    setRooms(prev => patchRoom(prev, roomId, { unreadCount: 0 }));
    loadMessages(roomId);
  }, [loadMessages]);

  const clearSelectedRoom = useCallback(() => {
    selectedRef.current = null;
    setSelectedRoomId(null);
  }, []);

  return { rooms, isConnected, selectedRoomId, selectRoom, clearSelectedRoom, sendMessage };
}

function handleSocketMessage(
  event: MessageEvent,
  selectedRoomId: string | null,
  setRooms: Dispatch<SetStateAction<Rooms>>
) {
  try {
    const data = JSON.parse(event.data as string);
    setRooms(prev => applyAdminSocketEvent(prev, data, selectedRoomId));
  } catch {
    // noop
  }
}

function appendRestAdminMessage(
  setRooms: Dispatch<SetStateAction<Rooms>>,
  roomId: string,
  content: string
) {
  const message: AdminMessage = {
    id: String(Date.now()),
    username: '관리자',
    content,
    fromAdmin: true,
    type: 'message',
    timestamp: new Date().toISOString(),
    roomId,
  };
  setRooms(prev => {
    const room = prev.get(roomId);
    if (!room) return prev;
    return patchRoom(prev, roomId, {
      messages: [...room.messages, message],
      lastMessage: message.content,
      lastTimestamp: message.timestamp,
    });
  });
}
