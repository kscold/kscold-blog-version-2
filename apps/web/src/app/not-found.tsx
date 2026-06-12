import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * 전역 404 화면.
 *
 * 모든 notFound() 호출(없는 글·피드·카테고리·태그·팀)이 이 화면으로 모인다.
 * 애드센스 정책상 "게시자 콘텐츠가 없는 화면"이므로 광고(AdSenseScript)를
 * 절대 렌더하지 않으며, 검색엔진 색인도 막는다(noindex).
 *
 * 헤더·사이드바·푸터는 ClientLayout 이 감싸주므로 본문만 구성한다.
 */
export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-surface-400 mb-4">
          404 — Not Found
        </p>
        <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tighter text-surface-900 dark:text-surface-50 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-10 leading-relaxed">
          요청하신 페이지가 존재하지 않거나, 삭제되었거나, 주소가 변경되었을 수 있습니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white rounded-xl hover:bg-surface-700 transition-colors font-bold text-sm"
          >
            홈으로
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 rounded-xl hover:border-surface-900 hover:text-surface-900 dark:hover:text-surface-50 transition-colors font-bold text-sm"
          >
            블로그
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 rounded-xl hover:border-surface-900 hover:text-surface-900 dark:hover:text-surface-50 transition-colors font-bold text-sm"
          >
            피드
          </Link>
        </div>
      </div>
    </div>
  );
}
