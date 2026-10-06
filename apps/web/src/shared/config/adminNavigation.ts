export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  description: string;
  /** 개인 문서처럼 공개 화면의 스크립트 상태를 이어받으면 안 되는 메뉴는 전체 페이지 이동으로 연다. */
  hardNavigation?: boolean;
  /** 상위 메뉴 안에서 다시 고를 수 있는 하위 공간. 대시보드 바로가기에는 올리지 않는다. */
  nested?: boolean;
  /** 기존 E2E가 찾는 식별자. 사이드바와 대시보드에서 각각 다른 값을 쓴다. */
  sidebarTestId?: string;
  dashboardTestId?: string;
}

export interface AdminNavGroup {
  key: string;
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_HOME: AdminNavItem = {
  key: 'dashboard',
  label: '대시보드',
  href: '/admin',
  description: '확인할 일과 최근 현황을 한눈에 봅니다',
};

/** 관리자 메뉴의 단일 기준. 사이드바와 대시보드 바로가기가 같은 묶음과 이름을 쓴다. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    key: 'content',
    label: '콘텐츠',
    items: [
      {
        key: 'posts',
        label: '포스트',
        href: '/admin/posts',
        description: '블로그 글을 쓰고 발행 상태를 관리합니다',
      },
      {
        key: 'feed',
        label: '피드',
        href: '/admin/feed',
        description: '짧은 기록과 링크를 올리고 정리합니다',
      },
      {
        key: 'vault',
        label: 'Vault 노트',
        href: '/admin/vault',
        description: '지식 노트를 쓰고 Agent가 어떤 노트로 답했는지 확인합니다',
      },
      {
        key: 'categories',
        label: '카테고리',
        href: '/admin/categories',
        description: '글 분류와 열람 제한을 관리합니다',
      },
      {
        key: 'tags',
        label: '태그',
        href: '/admin/tags',
        description: '태그를 정리하고 비슷한 태그를 합칩니다',
      },
    ],
  },
  {
    key: 'community',
    label: '소통',
    items: [
      {
        key: 'chat',
        label: '채팅',
        href: '/admin/chat',
        description: '방문자와 실시간으로 대화합니다',
      },
      {
        key: 'access-requests',
        label: '열람 요청',
        href: '/admin/access-requests',
        description: '제한된 글의 열람 요청을 승인하거나 거절합니다',
      },
      {
        key: 'users',
        label: '사용자',
        href: '/admin/users',
        description: '가입한 사용자의 프로필과 상태를 관리합니다',
      },
      {
        key: 'admin-night',
        label: 'Admin Night',
        href: '/admin/admin-night',
        description: '참가 신청을 확인하고 일정을 확정합니다',
      },
    ],
  },
  {
    key: 'operations',
    label: '정산·알림',
    items: [
      {
        key: 'stack-share',
        label: '공동 구독 정산',
        href: '/admin/stack-share',
        description: '분담금을 계산해 알림톡으로 정산을 요청합니다',
      },
      {
        key: 'message-deliveries',
        label: '알림 발송 로그',
        href: '/admin/message-deliveries',
        description: '알림톡과 이메일이 실제로 도착했는지 확인합니다',
      },
      {
        key: 'payment-preview',
        label: '결제 화면',
        href: '/admin/payment-preview',
        description: '상품 결제 화면을 미리 확인합니다',
      },
    ],
  },
  {
    key: 'files',
    label: '자료',
    items: [
      {
        key: 'documents',
        label: '개인 문서함',
        href: '/admin/documents',
        description: '이력서·경력 소스·스토리를 비공개로 보관합니다',
        hardNavigation: true,
        sidebarTestId: 'admin-documents-sidebar-link',
        dashboardTestId: 'admin-documents-link',
      },
      {
        key: 'resumes',
        label: '이력서 관리',
        href: '/admin/documents/resumes',
        description: '제출용 이력서를 모아둡니다',
        hardNavigation: true,
        nested: true,
        sidebarTestId: 'admin-resumes-sidebar-link',
      },
      {
        key: 'sources',
        label: '경력 소스 관리',
        href: '/admin/documents/sources',
        description: '경력의 근거 자료를 모아둡니다',
        hardNavigation: true,
        nested: true,
        sidebarTestId: 'admin-sources-sidebar-link',
      },
      {
        key: 'stories',
        label: '스토리 관리',
        href: '/admin/documents/stories',
        description: '면접과 회고 스토리를 모아둡니다',
        hardNavigation: true,
        nested: true,
        sidebarTestId: 'admin-stories-sidebar-link',
      },
      {
        key: 'storage',
        label: '스토리지',
        href: '/admin/storage',
        description: '블로그 버킷의 파일과 폴더를 관리합니다',
        dashboardTestId: 'admin-storage-link',
      },
    ],
  },
  {
    key: 'tools',
    label: '도구',
    items: [
      {
        key: 'testing',
        label: 'QA / E2E',
        href: '/admin/testing',
        description: '시나리오와 Playwright 실행을 확인합니다',
        dashboardTestId: 'admin-qa-link',
      },
    ],
  },
];

/** `/admin-night` 같은 공개 경로와 섞이지 않도록 `/admin` 과 그 하위 경로만 관리자 화면으로 본다. */
export function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/**
 * 현재 경로에 해당하는 메뉴를 하나만 고른다.
 * 하위 화면(글 수정 등)에서도 상위 메뉴가 켜지도록 가장 길게 겹치는 메뉴를 택한다.
 */
export function findActiveAdminHref(pathname: string) {
  const hrefs = [ADMIN_HOME, ...ADMIN_NAV_GROUPS.flatMap(group => group.items)].map(
    item => item.href
  );
  const matches = hrefs.filter(href =>
    href === ADMIN_HOME.href
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)
  );
  return matches.sort((left, right) => right.length - left.length)[0] ?? null;
}
