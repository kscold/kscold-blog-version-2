export type { AdminMessage, AdminRoom, ChatRoomSummary, VisitorChatMessage } from './model/types';
export { fetchChatRooms, fetchRoomMessages, sendRestMessage } from './api/chatAdminApi';
export { fetchMyChatMessages, sendVisitorMessage } from './api/chatApi';

// FSD public API 보강
export { applyAdminSocketEvent, mergeRestRooms, patchRoom } from './lib/adminRoomState';
export type { Rooms } from './lib/adminRoomState';
export { toVisitorMessage } from './lib/messageMappers';
export type { RawChatPayload } from './lib/messageMappers';
