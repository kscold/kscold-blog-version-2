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

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(date);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function normalizeDate(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toBadgeLabel(state: AdminNightSlotState) {
  if (state === 'tonight') return 'Tonight';
  if (state === 'weekend') return 'Weekend';
  return 'Open';
}

function buildSlot(date: Date, today: Date): AdminNightSlot {
  const config = WEEKDAY_SLOT_CONFIG[date.getDay()];
  const state: AdminNightSlotState =
    normalizeDate(date).getTime() === today.getTime()
      ? 'tonight'
      : date.getDay() === 0 || date.getDay() === 6
        ? 'weekend'
        : 'upcoming';
  const dateKey = formatLocalDateKey(date);

  return {
    slotKey: `${dateKey}|${config.focus}`,
    date: dateKey,
    dateLabel: formatDateLabel(date),
    weekday: formatWeekday(date),
    timeLabel: config.timeLabel,
    focus: config.focus,
    description: config.description,
    state,
    badgeLabel: toBadgeLabel(state),
  };
}

export function buildAdminNightSlots(now: Date) {
  const weekStart = startOfWeek(now);
  const today = normalizeDate(now);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return buildSlot(date, today);
  });
}

export function buildUpcomingAdminNightSlots(now: Date, days = 14) {
  const today = normalizeDate(now);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return buildSlot(date, today);
  });
}

export function findAdminNightSlot(slots: AdminNightSlot[], slotKey?: string | null) {
  return slots.find(slot => slot.slotKey === slotKey) ?? null;
}
