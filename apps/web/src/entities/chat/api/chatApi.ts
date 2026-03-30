import apiClient from '@/shared/api/api-client';
import type { VisitorChatMessage } from '../model/types';
import { toVisitorMessage, type RawChatPayload } from '../lib/messageMappers';

export async function fetchMyChatMessages(limit = 50): Promise<VisitorChatMessage[]> {
  const messages = await apiClient.get<RawChatPayload[]>(`/chat/messages?limit=${limit}`);
  return messages.map(toVisitorMessage);
}

export async function sendVisitorMessage(content: string): Promise<VisitorChatMessage> {
  const message = await apiClient.post<RawChatPayload>('/chat/messages', { content });
  return toVisitorMessage(message);
}
