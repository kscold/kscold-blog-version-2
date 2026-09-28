// 경로 문자열 대신 라우트 파라미터로 판별해 공개 공통 번들에 공유 주소를 남기지 않는다.
export function isStandalonePage(params: { applicationPage?: unknown } | null): boolean {
  return typeof params?.applicationPage === 'string';
}
