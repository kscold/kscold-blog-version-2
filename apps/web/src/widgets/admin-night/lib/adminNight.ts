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

export interface AdminNightStep {
  id: string;
  title: string;
  description: string;
}

export const ADMIN_NIGHT_PARTICIPATION_OPTIONS: {
  value: AdminNightParticipationMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'ONLINE',
    label: '온라인',
    description: 'Google Meet, Discord, 화면 공유처럼 온라인으로 붙을 수 있어요.',
  },
  {
    value: 'OFFLINE',
    label: '오프라인',
    description: '카페나 작업 공간에서 실제로 만나 조용히 각자 할 일을 진행해요.',
  },
  {
    value: 'FLEXIBLE',
    label: '둘 다 가능',
    description: '온라인도 좋고 오프라인 만남도 괜찮아요. 일정에 맞춰 조율할 수 있어요.',
  },
];

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
    description: '각자 할 일을 켜 두고, 같은 시간대에 조용히 붙어 있는 만남의 시간입니다.',
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
    description: '각자 할 일을 켜 두고, 같은 시간대에 조용히 붙어 있는 만남의 시간입니다.',
  },
  6: {
    focus: 'Weekend Reset',
    timeLabel: '14:00 - 16:30',
    description: '주말 낮의 여유로운 카페에서 한 주간 쌓인 밀린 잡무를 비워내고 새 주를 준비합니다.',
  },
};

export const ADMIN_NIGHT_KEYWORDS = ['Body Doubling', '각할모', '퇴근 후 만남'];

export const ADMIN_NIGHT_HERO_TITLE = '퇴근 후, 각자 할 일을 끝내는 밤';

export const ADMIN_NIGHT_HERO_PARAGRAPHS = [
  "Admin Night는 미뤄둔 개인 잡무를 조용히 끝내는 '각할모(각자 할 일 하는 모임)' 공간입니다. 메일 답장, 블로그 초안, 작은 버그 수정, 문서 정리까지.",
  '오래 이야기하지 않아도 좋습니다. 누군가와 같은 시간대에 몰입하고 있다는 감각만으로도, 미뤄둔 일을 시작하기가 훨씬 쉬워지니까요.',
];

export const ADMIN_NIGHT_PROCESS_TITLE = '신청 PR ➔ Merge / Meet';

export const ADMIN_NIGHT_PROCESS_DESCRIPTION =
  '참여 방식은 개발자들의 워크플로우를 닮았습니다. Admin Night 참여 PR(신청)을 가볍게 보내주세요. 코드가 아닌 시간과 의지를 리뷰하고, 확인 후 승인(Merge)되면 실제 온·오프라인의 만남(Meet)으로 이어지는 흐름입니다.';

export const ADMIN_NIGHT_CALENDAR_DESCRIPTION =
  '거창한 스터디가 아닙니다. 같은 시간대에 각자 할 일을 끝내는 조용한 작업 문화에 가깝습니다.';

export const ADMIN_NIGHT_CULTURE_TITLE = '술 대신, 각자 끝낼 일을 들고 모이는 밤';

export const ADMIN_NIGHT_CULTURE_PARAGRAPHS = [
  '굳이 긴 대화를 나누지 않아도, 무언가를 같이 해야 한다는 부담을 갖지 않아도 괜찮습니다. 타자 소리와 마우스 클릭 소리, 누군가 내 곁에서 집중하고 있다는 사실만으로도 훌륭한 동기부여가 됩니다.',
  '각자의 속도로, 각자의 어드민을 비워내는 밤. 함께하시겠어요?',
  '뭐, 사실 술도 사주시면 좋습니다. 그래도 Admin Night에서는 끝낼 일 하나쯤 챙겨 와 주시면 더 잘 어울립니다.',
];

export const ADMIN_NIGHT_STEPS: AdminNightStep[] = [
  {
    id: 'pick-task',
    title: 'Pick Tonight Task',
    description: '밀린 메일, 문서 정리, 블로그 초안, 작은 버그처럼 오늘 같이 끝내고 싶은 일을 먼저 고릅니다.',
  },
  {
    id: 'request-pr',
    title: 'Send PR',
    description: '실명, 원하는 시간, 진행 방식과 함께 같이 보고 싶은 맥락을 짧게 남깁니다.',
  },
  {
    id: 'merge-meet',
    title: 'Merge / Meet',
    description: '김승찬이 확인하고 승인하면 일정이 캘린더에 올라가고, 같은 시간대의 조용한 만남으로 이어집니다.',
  },
];

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
