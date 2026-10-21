// 공유 주소를 공개 공통 번들에 남기지 않도록, 비공개 공유 화면은 경로 문자열 대신 라우트 파라미터로 판별한다.
// 경로로 판별하는 화면은 이미 공개적으로 안내하는 주소만 둔다(강의 슬라이드에 적힌 다운로드 페이지 등).
// 강사 발표 화면은 링크하지 않지만 관리자만 열 수 있어 주소가 번들에 남아도 된다.
const PUBLIC_STANDALONE_PATHS = new Set(['/hansalim/slides', '/hansalim/presenter', '/hansalim/survey']);
// 블로그 틀 안에서 보여 주지만 GA·방문 기록은 남기지 않는 화면. 강의 참가자는 추적 없이 자료를 받게 한다.
const UNTRACKED_PUBLIC_PATHS = new Set(['/hansalim', ...PUBLIC_STANDALONE_PATHS]);

// 블로그 장식 커서(흰 동그라미) 대신 운영체제 기본 화살표를 쓰는 화면. 강의 참가자가 버튼 위에서도 커서를 놓치지 않게 한다.
const NATIVE_CURSOR_PATHS = new Set(['/hansalim']);

type PageParams = { applicationPage?: unknown } | null;

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, '') || '/';
}

/** 사이트 공통 틀(메뉴·방문 추적·GA·전역 Agent) 없이 단독으로 보여 주는 화면인지 판별한다. */
export function isStandalonePage(params: PageParams, pathname?: string | null): boolean {
  if (typeof params?.applicationPage === 'string') return true;
  return pathname != null && PUBLIC_STANDALONE_PATHS.has(normalizePath(pathname));
}

/** GA·방문 기록을 남기지 않는 화면인지 판별한다. 단독 화면은 모두 여기에 든다. */
export function isUntrackedPage(params: PageParams, pathname?: string | null): boolean {
  if (isStandalonePage(params, pathname)) return true;
  return pathname != null && UNTRACKED_PUBLIC_PATHS.has(normalizePath(pathname));
}

/** 장식 커서를 붙이지 않고 기본 마우스 커서를 그대로 보여 주는 화면인지 판별한다. */
export function usesNativeCursor(pathname?: string | null): boolean {
  return pathname != null && NATIVE_CURSOR_PATHS.has(normalizePath(pathname));
}
