export type AdminNightStatus = 'PENDING' | 'INFO_REQUESTED' | 'APPROVED' | 'REJECTED';
export type AdminNightParticipationMode = 'ONLINE' | 'OFFLINE' | 'FLEXIBLE';

export interface AdminNightSlotPayload {
  slotKey: string;
  date: string;
  weekday: string;
  timeLabel: string;
  focus: string;
  badgeLabel: string;
}

export interface AdminNightRequest {
  id: string;
  userId: string;
  requesterName: string;
  requesterEmail?: string;
  taskTitle: string;
  message?: string | null;
  participationMode?: AdminNightParticipationMode | null;
  status: AdminNightStatus;
  preferredSlot: AdminNightSlotPayload;
  scheduledSlot?: AdminNightSlotPayload | null;
  reviewNote?: string | null;
  decidedByName?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface AdminNightCalendarEntry {
  id: string;
  requesterLabel: string;
  taskTitle: string;
  participationMode?: AdminNightParticipationMode | null;
  scheduledSlot: AdminNightSlotPayload;
  createdAt: string;
}
