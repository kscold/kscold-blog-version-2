import { Post } from '@/types/blog';

export interface AdminNightSlot {
  id: string;
  weekday: string;
  dateLabel: string;
  timeLabel: string;
  focus: string;
  description: string;
  state: 'today' | 'open' | 'closed';
}

export interface AdminNightQueueItem {
  id: string;
  title: string;
  detail: string;
  tone: 'draft' | 'published' | 'archived' | 'focus';
  link: string;
}

export interface AdminNightActionItem {
  id: string;
  label: string;
  detail: string;
  link: string;
}

const SLOT_TEMPLATES = [
  { timeLabel: '20:30 - 22:00', focus: 'Claude Workspace', description: '초안과 메모를 모아 오늘 야간 슬롯으로 정리합니다.' },
  { timeLabel: '21:00 - 22:40', focus: 'Source Review', description: '링크, 코드 블록, 썸네일을 다시 훑고 맥락을 맞춥니다.' },
  { timeLabel: '21:30 - 23:00', focus: 'Ship Window', description: 'QA를 끝내고 배포 직전 체크리스트를 한 번 더 밟습니다.' },
  { timeLabel: '20:40 - 22:20', focus: 'Docs Sweep', description: '문서, 요약, 메타 설명을 정리해 공개 흐름을 매끄럽게 만듭니다.' },
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

function toQueueTone(post: Post['status']): AdminNightQueueItem['tone'] {
  if (post === 'DRAFT') return 'draft';
  if (post === 'ARCHIVED') return 'archived';
  return 'published';
}

export function buildAdminNightSlots(now: Date) {
  const weekStart = startOfWeek(now);
  const todayKey = new Date(now).toDateString();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const template = SLOT_TEMPLATES[index % SLOT_TEMPLATES.length];
    const state =
      date.toDateString() === todayKey
        ? 'today'
        : date.getTime() < todayStart.getTime()
          ? 'closed'
          : 'open';

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

export function buildAdminNightQueue(recentPosts: Post[]) {
  const items = recentPosts.slice(0, 3).map((post) => ({
    id: post.id,
    title: post.title,
    detail: `${post.category?.name ?? '미분류'} · ${post.status === 'DRAFT' ? '초안 정리' : post.status === 'PUBLISHED' ? '출고 검수' : '보관 메모'}`,
    tone: toQueueTone(post.status),
    link: `/admin/posts/${post.id}/edit`,
  }));

  if (items.length > 0) {
    return items;
  }

  return [
    {
      id: 'fallback-draft',
      title: '새 포스트 초안 만들기',
      detail: '오늘 밤 붙여볼 글감을 먼저 열어 둡니다.',
      tone: 'focus',
      link: '/admin/posts/new',
    },
    {
      id: 'fallback-qa',
      title: 'QA 흐름 다시 점검',
      detail: '배포 직전 화면과 주요 시나리오를 한 번 더 봅니다.',
      tone: 'published',
      link: '/admin/testing',
    },
    {
      id: 'fallback-chat',
      title: '답장 큐 비우기',
      detail: '채팅과 요청함을 정리한 뒤 마감합니다.',
      tone: 'archived',
      link: '/admin/chat',
    },
  ] satisfies AdminNightQueueItem[];
}

export function buildAdminNightActions(recentPosts: Post[], totalChatRooms: number, totalMessages: number) {
  const firstDraft = recentPosts.find((post) => post.status === 'DRAFT');

  return [
    {
      id: 'workspace',
      label: 'Tonight Workspace',
      detail: firstDraft ? `${firstDraft.title} 이어쓰기` : '새 초안 바로 시작',
      link: firstDraft ? `/admin/posts/${firstDraft.id}/edit` : '/admin/posts/new',
    },
    {
      id: 'review',
      label: 'Runbook / QA',
      detail: '야간 체크리스트와 시나리오 흐름 점검',
      link: '/admin/testing',
    },
    {
      id: 'reply',
      label: 'Reply / Ship',
      detail: `채팅 ${totalChatRooms}개 방 · 메시지 ${totalMessages}건 확인`,
      link: '/admin/chat',
    },
  ] satisfies AdminNightActionItem[];
}
