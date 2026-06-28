export type AdminNightStatus = 'PENDING' | 'INFO_REQUESTED' | 'APPROVED' | 'REJECTED';
export type AdminNightParticipationMode = 'ONLINE' | 'OFFLINE' | 'FLEXIBLE';
export type AdminNightProgramInterestLevel = 'CURIOUS' | 'WANT_TO_ATTEND' | 'READY_IF_SCHEDULE_FITS';
export type AdminNightProgramPreferredFormat = 'ONLINE' | 'OFFLINE' | 'HYBRID' | 'FLEXIBLE';
export type AdminNightProgramExperienceLevel =
  | 'NEW_TO_AGENT'
  | 'BUILT_TOY'
  | 'BUILDING_PRODUCT'
  | 'OPERATING_SERVICE';
export type AdminNightProgramSessionStyle = 'LECTURE' | 'WORKSHOP' | 'NETWORKING' | 'MIXED';
export type AdminNightProgramSessionLength = 'SHORT_90' | 'STANDARD_120' | 'HALF_DAY' | 'SERIES';
export type AdminNightProgramFoodPreference = 'NO_NEED' | 'DRINKS_ONLY' | 'LIGHT_SNACK' | 'MEAL';
export type AdminNightProgramPreferredDay = 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

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

export interface AdminNightProgramVote {
  id: string;
  programKey: string;
  userId?: string | null;
  requesterName: string;
  requesterEmail?: string;
  contactEmail?: string;
  contact?: string | null;
  interestLevel: AdminNightProgramInterestLevel;
  preferredFormat: AdminNightProgramPreferredFormat;
  experienceLevel: AdminNightProgramExperienceLevel;
  sessionStyle?: AdminNightProgramSessionStyle | null;
  sessionLength?: AdminNightProgramSessionLength | null;
  foodPreference?: AdminNightProgramFoodPreference | null;
  preferredDays: AdminNightProgramPreferredDay[];
  preferredTimes: string[];
  interestedTopics: string[];
  desiredTakeaways?: string | null;
  message?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminNightProgramVoteSummary {
  programKey: string;
  totalVotes: number;
  interestLevelCounts: Record<string, number>;
  preferredFormatCounts: Record<string, number>;
  experienceLevelCounts: Record<string, number>;
  sessionStyleCounts: Record<string, number>;
  sessionLengthCounts: Record<string, number>;
  foodPreferenceCounts: Record<string, number>;
  preferredDayCounts: Record<string, number>;
  preferredTimeCounts: Record<string, number>;
  interestedTopicCounts: Record<string, number>;
  updatedAt?: string | null;
}
