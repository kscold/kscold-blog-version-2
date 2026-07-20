'use client';

import Script from 'next/script';

/**
 * 게시자 콘텐츠가 "실제로 존재하는" 화면에서만 마운트하는 애드센스 스크립트.
 *
 * 애드센스 정책상 다음 화면에는 광고가 게재되면 안 됨.
 *   - 게시자 콘텐츠가 없거나 가치가 낮은 화면 (빈 목록, 검색 결과 없음 등)
 *   - 아직 준비 중인 화면 (로딩 스켈레톤)
 *   - 404 / notFound, 알림·이동 등 행동 목적 화면
 *
 * 과거에는 layout(전역)에서 경로(pathname)만 보고 광고를 로드했는데,
 * 같은 경로 패턴 안의 404·빈 상태·스켈레톤에도 광고 코드가 붙어 정책 위반으로
 * 반려됐다. 그래서 "경로 기준"을 버리고, 실제 콘텐츠가 확정된 페이지/분기에서만
 * 이 컴포넌트를 직접 렌더해 "콘텐츠 기준"으로 광고를 로드함.
 *
 * next/script 는 동일 id 를 중복 렌더해도 한 번만 로드하므로, 여러 콘텐츠
 * 지점에서 마운트해도 안전함.
 */
export function AdSenseScript({ clientId }: { clientId?: string } = {}) {
  const resolvedClientId = clientId ?? process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!resolvedClientId) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${resolvedClientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
