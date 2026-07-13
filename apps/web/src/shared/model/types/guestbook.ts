export interface GuestbookEntry {
  id: string;
  authorName: string;
  isAdmin: boolean;
  canDelete: boolean;
  content: string;
  createdAt: string;
}

export interface GuestbookEntryCreateRequest {
  content: string;
}
