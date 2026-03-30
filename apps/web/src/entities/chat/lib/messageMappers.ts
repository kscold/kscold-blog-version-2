import type { AdminMessage, VisitorChatMessage } from '../model/types';

export interface RawChatPayload {
  id?: string;
  username?: string;
  content?: string;
  fromAdmin?: boolean;
  type?: string;
  timestamp?: string;
  roomId?: string;
}

export function toAdminMessage(message: RawChatPayload, fallbackRoomId: string): AdminMessage {
  return {
    id: message.id || String(Date.now()),
    username: message.username || '',
    content: message.content || '',
    fromAdmin: Boolean(message.fromAdmin),
    type: message.type === 'SYSTEM' || message.type === 'system' ? 'system' : 'message',
    timestamp: message.timestamp || new Date().toISOString(),
    roomId: message.roomId || fallbackRoomId,
  };
}

export function toVisitorMessage(message: RawChatPayload): VisitorChatMessage {
  const isSystem = message.type === 'SYSTEM' || message.type === 'system';
  return {
    id: message.id || String(Date.now()),
    user: {
      id: null,
      name: isSystem ? 'SYSTEM' : message.username || '익명',
    },
    content: message.content || '',
    fromAdmin: Boolean(message.fromAdmin),
    type: isSystem ? 'SYSTEM' : 'TEXT',
    createdAt: message.timestamp || new Date().toISOString(),
  };
}
