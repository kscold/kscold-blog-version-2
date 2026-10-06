export const scenarioLinks = [
  {
    title: '메인 홈',
    description: '히어로 문구와 주요 CTA, 공개 내비게이션을 확인합니다.',
    href: '/',
    testId: 'admin-qa-scenario-home',
  },
  {
    title: '방명록',
    description: '로그인 상태별 안내, 작성, 삭제 흐름을 점검합니다.',
    href: '/guestbook',
    testId: 'admin-qa-scenario-guestbook',
  },
  {
    title: '블로그 목록',
    description: '카테고리, 검색, 카드 레이아웃 반응형을 확인합니다.',
    href: '/blog',
    testId: 'admin-qa-scenario-blog',
  },
  {
    title: '피드',
    description: '댓글 작성 정책과 리스트 배치를 확인합니다.',
    href: '/feed',
    testId: 'admin-qa-scenario-feed',
  },
  {
    title: 'Vault',
    description: '노트 탐색과 댓글 흐름, 모바일 레이아웃을 확인합니다.',
    href: '/vault',
    testId: 'admin-qa-scenario-vault',
  },
  {
    title: '채팅 관리',
    description: '관리자 채팅방 목록과 대화 화면을 점검합니다.',
    href: '/admin/chat',
    testId: 'admin-qa-scenario-admin-chat',
  },
  {
    title: '개인 문서함',
    description: '관리자 전용 이력서 업로드와 비공개 문서 정리를 확인합니다.',
    href: '/admin/documents',
    testId: 'admin-qa-scenario-admin-documents',
  },
  {
    title: '스토리지 관리',
    description: 'MinIO blog 버킷 탐색과 파일 관리 흐름을 확인합니다.',
    href: '/admin/storage',
    testId: 'admin-qa-scenario-admin-storage',
  },
  {
    title: '포스트 관리',
    description: '모바일 카드 레이아웃과 관리 액션을 확인합니다.',
    href: '/admin/posts',
    testId: 'admin-qa-scenario-admin-posts',
  },
] as const;

export const commands = [
  {
    title: 'QA 러너 설치 · 재시작',
    command: './docker/maintenance/install-qa-runner.sh',
    testId: 'admin-qa-command-runner',
  },
  {
    title: '전체 E2E 실행',
    command: 'pnpm --dir apps/web test:e2e',
    testId: 'admin-qa-command-run',
  },
  {
    title: 'CI와 같은 구성으로 전체 E2E 실행',
    command: 'pnpm --dir apps/web test:e2e:ci',
    testId: 'admin-qa-command-ci',
  },
  {
    title: 'Playwright UI 모드 열기',
    command: 'pnpm --dir apps/web test:e2e:ui',
    testId: 'admin-qa-command-open',
  },
] as const;

export interface QaScreenshot {
  name: string;
  url: string;
}

export interface QaSession {
  id: string;
  suiteId: string;
  suiteLabel: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string | null;
  endedAt: string | null;
  exitCode: number | null;
  logs: string[];
  screenshots: QaScreenshot[];
  latestScreenshotUrl: string | null;
}

export interface QaSessionResponse {
  session: QaSession | null;
  message?: string;
  stopped?: boolean;
  deleted?: boolean;
}

export function formatSessionId(value: string | null) {
  if (!value) return '아직 없음';

  const suffix = value.split('-').at(-1);
  return suffix ? `session-${suffix}` : value;
}

export function formatLogOutput(lines: string[]) {
  return lines.join('\n');
}

export function formatScreenshotLabel(name: string) {
  const fileName = name.split('/').pop() || name;

  const labels: Record<string, string> = {
    '01-dashboard.png': '01 대시보드',
    '02-posts.png': '02 포스트 관리',
    '03-categories.png': '03 카테고리 관리',
    '04-chat.png': '04 채팅 관리',
    '05-testing.png': '05 QA / E2E',
    '06-access-requests.png': '06 열람 요청 관리',
    '99-failure.png': '실패한 순간의 화면',
  };

  return labels[fileName] ?? fileName.replace(/\.png$/i, '');
}

export function formatTime(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

export function statusLabel(status: QaSession['status'] | 'idle') {
  if (status === 'running') return '실행 중';
  if (status === 'completed') return '통과';
  if (status === 'failed') return '실패';
  return '대기 중';
}

export function statusTone(status: QaSession['status'] | 'idle') {
  if (status === 'running') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'failed') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-surface-200 bg-surface-50 text-surface-500';
}
