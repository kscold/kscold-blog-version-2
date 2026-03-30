import apiClient from '@/shared/api/api-client';
import type { AdminMessage, ChatRoomSummary } from '../model/types';
import { toAdminMessage, type RawChatPayload } from '../lib/messageMappers';

export async function fetchChatRooms(): Promise<ChatRoomSummary[]> {
  return apiClient.get<ChatRoomSummary[]>('/admin/chat/rooms');
}

export async function fetchRoomMessages(roomId: string): Promise<AdminMessage[]> {
  const page = await apiClient.get<{ content: RawChatPayload[] }>(
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
