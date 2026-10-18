// 공유 주소를 공개 공통 번들에 남기지 않도록, 비공개 공유 화면은 경로 문자열 대신 라우트 파라미터로 판별한다.
// 경로로 판별하는 화면은 이미 공개적으로 안내하는 주소만 둔다(강의 슬라이드에 적힌 다운로드 페이지 등).
const PUBLIC_STANDALONE_PATHS = new Set(['/hansalim']);

/** 사이트 공통 틀(메뉴·방문 추적·GA·전역 Agent) 없이 단독으로 보여 주는 화면인지 판별한다. */
export function isStandalonePage(
  params: { applicationPage?: unknown } | null,
  pathname?: string | null
): boolean {
  if (typeof params?.applicationPage === 'string') return true;
  return pathname != null && PUBLIC_STANDALONE_PATHS.has(pathname.replace(/\/$/, '') || '/');
}
