'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * 게시자 콘텐츠가 충실한 페이지에서만 애드센스 스크립트를 로드한다.
 *
 * 애드센스 정책상 로그인·관리자·설정·방명록·정책·빈/준비 중 화면 같은
 * "게시자 콘텐츠가 없는 화면"에는 광고가 게재되면 안 된다. 전역(head)에서
 * 자동 광고를 로드하면 이런 페이지에도 광고가 붙어 정책 위반으로 반려된다.
 *
 * 따라서 콘텐츠 페이지(블로그·피드·소개·태그·홈)만 화이트리스트로 허용한다.
 */
const AD_ALLOWED_PATHS: RegExp[] = [
  /^\/$/, // 홈 (소개·추천 글)
  /^\/blog(\/.*)?$/, // 블로그 아카이브·카테고리·글 상세
  /^\/feed(\/.*)?$/, // 피드 목록·글 상세
  /^\/info(\/.*)?$/, // 소개
  /^\/tags\/.+$/, // 태그별 글 목록
];

export function AdSenseScript({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const allowed = AD_ALLOWED_PATHS.some(re => re.test(pathname));

  if (!allowed) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
