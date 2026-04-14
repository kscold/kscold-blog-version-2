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
    id: 'pick-task',
    title: '끝낼 일과 가능한 시간대 정하기',
    description: '밀린 메일, 문서 정리, 블로그 초안, 작은 버그처럼 오늘 같이 붙어 끝내고 싶은 일을 먼저 고릅니다.',
  },
  {
    id: 'request-pr',
    title: '참가 의사를 PR처럼 보내기',
    description: '어드민 나이트에 붙고 싶다는 메시지를 먼저 보내고, 같이 보고 싶은 작업 맥락을 짧게 남깁니다.',
  },
  {
    id: 'merge-meet',
    title: '승인되면 Merge / Meet',
    description: '김승찬이 확인하고 승인하면 실제로 같은 시간대에 붙어서 카공하거나 흐름을 맞춰 작업합니다.',
  },
  {
    id: 'leave-trace',
    title: '끝나면 흔적 남기기',
    description: '작업이 끝나면 피드, 방명록, 링크 메모처럼 기록을 남기고, 가능하면 코드 PR도 자연스럽게 이어갑니다.',
  },
];

export const ADMIN_NIGHT_TAGS = [
  'Body Doubling',
  '각할모',
  '퇴근 후 카공',
  '신청 PR',
  'Merge / Meet',
];

export const ADMIN_NIGHT_LINKS: AdminNightLink[] = [
  {
    id: 'request',
    label: 'Admin Night 신청 보내기',
    detail: '참가 의사를 마치 PR처럼 먼저 보내고, 같이 붙고 싶은 작업을 한 줄 남깁니다.',
    href: '/admin-night?chat=open',
  },
  {
    id: 'guestbook',
    label: '방명록에 합류 의사 남기기',
    detail: '이번 주 같이 붙고 싶은 시간대나 주제를 남기면 흐름을 잡기 좋습니다.',
    href: '/guestbook',
  },
  {
    id: 'feed',
    label: '피드에서 오늘 작업 흐름 보기',
    detail: '지금 하고 있는 일이나 참고 링크를 짧게 남겨두고, 끝나면 결과도 바로 이어서 기록합니다.',
    href: '/feed',
  },
  {
    id: 'github',
    label: '블로그 레포 흐름 보기',
    detail: '실제 코드 작업이 붙는 날에는 저장소 흐름과 PR 맥락도 여기서 확인할 수 있습니다.',
    href: 'https://github.com/kscold/kscold-blog-version-2',
    external: true,
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
