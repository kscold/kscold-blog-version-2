export interface GuestbookReply {
  content: string;
  repliedAt: string;
}

export interface GuestbookEntry {
  id: string;
  authorName: string;
  isAdmin: boolean;
  canDelete: boolean;
  content: string;
  createdAt: string;
  reply: GuestbookReply | null;
}

export interface GuestbookEntryCreateRequest {
  content: string;
}

export interface GuestbookReplyRequest {
  content: string;
}
