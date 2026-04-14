export interface AdminNightSlot {
  id: string;
  weekday: string;
  dateLabel: string;
  timeLabel: string;
  focus: string;
  description: string;
  state: 'tonight' | 'upcoming' | 'weekend';
}

export interface AdminNightStep {
  id: string;
  title: string;
  description: string;
}

export interface AdminNightLink {
  id: string;
  label: string;
  detail: string;
  href: string;
  external?: boolean;
}

const SLOT_TEMPLATES = [
  {
    timeLabel: '20:30 - 22:00',
    focus: 'Inbox Sweep',
    description: '답장, 메모, 밀린 체크리스트처럼 시작 장벽이 낮은 일을 먼저 처리합니다.',
  },
  {
    timeLabel: '21:00 - 22:40',
    focus: 'Body Doubling',
    description: '각자 할 일을 켜 두고 같은 시간대에 조용히 몰입하는 카공 흐름입니다.',
  },
  {
    timeLabel: '21:30 - 23:00',
    focus: 'PR Window',
    description: '정리된 작업은 기록으로 남기고, 가능하면 이슈나 PR까지 연결합니다.',
  },
  {
    timeLabel: '14:00 - 16:30',
    focus: 'Weekend Reset',
    description: '주말 낮 시간에는 밀린 개인 잡무와 문서 정리를 가볍게 비웁니다.',
  },
];

export const ADMIN_NIGHT_STEPS: AdminNightStep[] = [
  {
    id: 'one-task',
    title: '끝낼 일 하나만 들고 오기',
    description: '밀린 메일, 문서 정리, 블로그 초안, 작은 버그 하나처럼 오늘 마감할 일을 고릅니다.',
  },
  {
    id: 'quiet-focus',
    title: '잠깐 이야기한 뒤 각자 몰입하기',
    description: '술 약속 대신 카페나 집에서 각자 작업하고, 같은 시간대에 붙어 있다는 감각만 유지합니다.',
  },
  {
    id: 'ship-something',
    title: '끝나면 기록이나 링크 남기기',
    description: '정리한 결과는 피드, 방명록, 이슈 링크처럼 흔적이 남는 방식으로 마무리합니다.',
  },
  {
    id: 'send-pr',
    title: '가능하면 PR까지 보내기',
    description: '혼자 미루던 작업이라도 작은 수정부터 공개 저장소나 문서 제안으로 이어가는 걸 권합니다.',
  },
];

export const ADMIN_NIGHT_TAGS = [
  'Body Doubling',
  '각할모',
  '퇴근 후 카공',
  'Weekend Reset',
  'PR Friendly',
];

export const ADMIN_NIGHT_LINKS: AdminNightLink[] = [
  {
    id: 'github',
    label: '블로그 레포 보기',
    detail: '작업 아이디어가 있다면 저장소를 보고 이슈나 PR 흐름을 바로 확인합니다.',
    href: 'https://github.com/kscold/kscold-blog-version-2',
    external: true,
  },
  {
    id: 'feed',
    label: '피드에 지금 흐름 남기기',
    detail: '오늘 밤 하고 있는 일이나 참고 링크를 짧게 남겨두면 다음 작업이 쉬워집니다.',
    href: '/feed',
  },
  {
    id: 'guestbook',
    label: '방명록으로 합류 의사 남기기',
    detail: '이번 주 같이 붙고 싶은 작업이나 관심 주제를 방명록에 남겨도 좋습니다.',
    href: '/guestbook',
  },
];

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(date);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
}

export function buildAdminNightSlots(now: Date) {
  const weekStart = startOfWeek(now);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const template = SLOT_TEMPLATES[isWeekend ? 3 : index % 3];
    const state: AdminNightSlot['state'] =
      date.getTime() === today.getTime()
        ? 'tonight'
        : isWeekend
          ? 'weekend'
          : 'upcoming';

    return {
      id: `${date.toISOString()}-${template.focus}`,
      weekday: formatWeekday(date),
      dateLabel: formatDateLabel(date),
      timeLabel: template.timeLabel,
      focus: template.focus,
      description: template.description,
      state,
    } satisfies AdminNightSlot;
  });
}
