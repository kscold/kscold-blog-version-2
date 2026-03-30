import type { AdminRoom, ChatRoomSummary } from '../model/types';
import { toAdminMessage, type RawChatPayload } from './messageMappers';

export type Rooms = Map<string, AdminRoom>;

export function patchRoom(rooms: Rooms, roomId: string, patch: Partial<AdminRoom>) {
  const next = new Map(rooms);
  const room = next.get(roomId);
  if (room) next.set(roomId, { ...room, ...patch });
  return next;
}

export function mergeRestRooms(rooms: Rooms, summaries: ChatRoomSummary[]) {
  const next = new Map(rooms);
  summaries.forEach(summary => {
    const existing = next.get(summary.roomId);
    next.set(summary.roomId, {
      userId: summary.roomId,
      username: existing?.username || summary.username,
      online: existing?.online ?? false,
      messages: existing?.messages ?? [],
      unreadCount: existing?.unreadCount ?? 0,
      lastMessage: summary.lastMessage,
      lastTimestamp: summary.lastTimestamp,
    });
  });
  return next;
}

export function applyAdminSocketEvent(rooms: Rooms, data: RawChatPayload & { rooms?: Array<{ userId: string; username: string }>; userId?: string }, selectedRoomId: string | null) {
  if (data.type === 'room_list') {
    const onlineIds = new Set((data.rooms || []).map(room => room.userId));
    const next = new Map(rooms);
    next.forEach((room, id) => next.set(id, { ...room, online: onlineIds.has(id) }));
    (data.rooms || []).forEach(room => {
      if (!next.has(room.userId)) next.set(room.userId, { userId: room.userId, username: room.username, online: true, messages: [], unreadCount: 0 });
    });
    return next;
  }
  if (data.type === 'room_joined' && data.userId) {
    const room = rooms.get(data.userId);
    return new Map(rooms).set(data.userId, { userId: data.userId, username: data.username || room?.username || '', online: true, messages: room?.messages ?? [], unreadCount: room?.unreadCount ?? 0, lastMessage: room?.lastMessage, lastTimestamp: room?.lastTimestamp });
  }
  if (data.type === 'room_left' && data.userId) return patchRoom(rooms, data.userId, { online: false });
  if ((data.type === 'message' || data.type === 'system') && data.roomId) {
    const message = toAdminMessage(data, data.roomId);
    const room = rooms.get(message.roomId);
    if (!room) {
      return new Map(rooms).set(message.roomId, { userId: message.roomId, username: message.username, online: true, messages: [message], unreadCount: selectedRoomId === message.roomId ? 0 : 1, lastMessage: message.content, lastTimestamp: message.timestamp });
    }
    return patchRoom(rooms, message.roomId, { messages: [...room.messages, message], lastMessage: message.content, lastTimestamp: message.timestamp, unreadCount: selectedRoomId === message.roomId ? 0 : room.unreadCount + 1 });
  }
  return rooms;
}
