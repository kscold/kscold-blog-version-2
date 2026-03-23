import apiClient from '@/shared/api/api-client';
import type { AdminMessage, ChatRoomSummary } from '../model/types';

interface RawMessage {
  id?: string;
  username?: string;
  content?: string;
  fromAdmin?: boolean;
  type?: string;
  timestamp?: string;
  roomId?: string;
}

function toAdminMessage(m: RawMessage, fallbackRoomId: string): AdminMessage {
  return {
    id: m.id || String(Date.now()),
    username: m.username || '',
    content: m.content || '',
    fromAdmin: Boolean(m.fromAdmin),
    type: m.type === 'SYSTEM' ? 'system' : 'message',
    timestamp: m.timestamp || '',
    roomId: m.roomId || fallbackRoomId,
  };
}

export async function fetchChatRooms(): Promise<ChatRoomSummary[]> {
  return apiClient.get<ChatRoomSummary[]>('/admin/chat/rooms');
}

export async function fetchRoomMessages(roomId: string): Promise<AdminMessage[]> {
  const page = await apiClient.get<{ content: RawMessage[] }>(
    `/admin/chat/rooms/${roomId}/messages?size=100`,
  );
  return (page.content || []).map(m => toAdminMessage(m, roomId));
}

export async function sendRestMessage(roomId: string, content: string): Promise<void> {
  await apiClient.post(`/admin/chat/rooms/${roomId}/messages`, {
    content,
    username: '관리자',
  });
}
