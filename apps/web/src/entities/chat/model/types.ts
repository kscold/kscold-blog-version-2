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

export interface ChatRoomSummary {
  roomId: string;
  username: string;
  lastMessage: string;
  lastTimestamp: string;
  messageCount: number;
}
