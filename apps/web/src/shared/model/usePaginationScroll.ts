'use client';

import { useLayoutEffect, useRef } from 'react';

/** 페이지 버튼으로 요청한 전환에만 적용하며 초기 진입·재조회·뒤로가기는 건드리지 않는다. */
export function usePaginationScroll(page: number, isLoading: boolean) {
  const pending = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pending.current !== page || isLoading) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    pending.current = null;
  }, [page, isLoading]);

  return (nextPage: number, changePage: (value: number) => void) => {
    if (nextPage === page) return;
    pending.current = nextPage;
    // 로딩 화면으로 높이가 줄어들기 전에 이동해 브라우저의 스크롤 보정과 충돌하지 않게 한다.
    window.scrollTo({ top: 0, behavior: 'instant' });
    changePage(nextPage);
  };
}
