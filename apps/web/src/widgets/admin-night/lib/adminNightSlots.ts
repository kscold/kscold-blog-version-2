import {
  addAdminNightDays,
  formatAdminNightDateLabel,
  formatAdminNightWeekday,
  getAdminNightWeekdayIndex,
} from './adminNightDate';

export type AdminNightSlotState = 'tonight' | 'upcoming' | 'weekend';
export type AdminNightParticipationMode = 'ONLINE' | 'OFFLINE' | 'FLEXIBLE';

export interface AdminNightSlot {
  slotKey: string;
  date: string;
  dateLabel: string;
  weekday: string;
  timeLabel: string;
  focus: string;
  description: string;
  state: AdminNightSlotState;
  badgeLabel: string;
}

export interface AdminNightSlotReference {
  slotKey?: string | null;
  date?: string | null;
  focus?: string | null;
}

const WEEKDAY_SLOT_CONFIG: Record<number, { focus: string; timeLabel: string; description: string }> = {
  0: {
    focus: 'Weekend Reset',
    timeLabel: '14:00 - 16:30',
    description: '주말 낮 시간에 밀린 개인 잡무를 비워내고 다음 주를 준비합니다.',
  },
  1: {
    focus: 'Inbox Sweep',
    timeLabel: '20:30 - 22:00',
    description: '답장, 메모, 밀린 체크리스트처럼 시작 장벽이 가장 낮은 일부터 가볍게 털어냅니다.',
  },
  2: {
    focus: 'Body Doubling',
    timeLabel: '21:00 - 22:40',
    description: '각자 할 일을 켜 두고, 같은 시간대에 조용히 만나는 시간입니다.',
  },
  3: {
    focus: 'PR Window',
    timeLabel: '21:30 - 23:00',
    description: '정리된 작업은 기록으로 남기고, 가능하면 이슈나 PR까지 깔끔하게 닫아냅니다.',
  },
  4: {
    focus: 'Inbox Sweep',
    timeLabel: '20:30 - 22:00',
    description: '답장, 메모, 밀린 체크리스트처럼 시작 장벽이 가장 낮은 일부터 가볍게 털어냅니다.',
  },
  5: {
    focus: 'Body Doubling',
    timeLabel: '21:00 - 22:40',
    description: '각자 할 일을 켜 두고, 같은 시간대에 조용히 만나는 시간입니다.',
  },
  6: {
    focus: 'Weekend Reset',
    timeLabel: '14:00 - 16:30',
    description: '주말 낮의 여유로운 카페에서 한 주간 쌓인 밀린 잡무를 비워내고 새 주를 준비합니다.',
  },
};

export function describeParticipationMode(mode?: AdminNightParticipationMode | null) {
  if (!mode) return '미정';
  if (mode === 'ONLINE') return '온라인';
  if (mode === 'OFFLINE') return '오프라인';
  return '온라인 / 오프라인 모두 가능';
}

function startOfWeek(dateKey: string) {
  const day = getAdminNightWeekdayIndex(dateKey);
  const diff = day === 0 ? -6 : 1 - day;
  return addAdminNightDays(dateKey, diff);
}

function toBadgeLabel(state: AdminNightSlotState) {
  if (state === 'tonight') return 'Tonight';
  if (state === 'weekend') return 'Weekend';
  return 'Open';
}

function buildSlot(dateKey: string, todayKey: string): AdminNightSlot {
  const weekdayIndex = getAdminNightWeekdayIndex(dateKey);
  const config = WEEKDAY_SLOT_CONFIG[weekdayIndex];
  const state: AdminNightSlotState =
    dateKey === todayKey
      ? 'tonight'
      : weekdayIndex === 0 || weekdayIndex === 6
        ? 'weekend'
        : 'upcoming';

  return {
    slotKey: `${dateKey}|${config.focus}`,
    date: dateKey,
    dateLabel: formatAdminNightDateLabel(dateKey),
    weekday: formatAdminNightWeekday(dateKey),
    timeLabel: config.timeLabel,
    focus: config.focus,
    description: config.description,
    state,
    badgeLabel: toBadgeLabel(state),
  };
}

export function buildAdminNightSlots(todayKey: string) {
  const weekStart = startOfWeek(todayKey);

  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = addAdminNightDays(weekStart, index);
    return buildSlot(dateKey, todayKey);
  });
}

export function buildUpcomingAdminNightSlots(todayKey: string, days = 14) {
  if (!Number.isSafeInteger(days) || days < 0) {
    throw new RangeError('Admin Night 조회 일수는 0 이상의 정수여야 합니다.');
  }

  return Array.from({ length: days }, (_, index) => {
    const dateKey = addAdminNightDays(todayKey, index);
    return buildSlot(dateKey, todayKey);
  });
}

export function findAdminNightSlot(
  slots: AdminNightSlot[],
  reference?: string | AdminNightSlotReference | null
) {
  if (typeof reference === 'string') {
    return slots.find(slot => slot.slotKey === reference) ?? null;
  }
  if (!reference) return null;

  const exactSlot = reference.slotKey
    ? slots.find(slot => slot.slotKey === reference.slotKey)
    : null;
  if (exactSlot) return exactSlot;
  if (!reference.date || !reference.focus) return null;

  return (
    slots.find(
      slot => slot.date === reference.date && slot.focus === reference.focus
    ) ?? null
  );
}
