'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface PdfPageScrollOptions {
  container: HTMLDivElement | null;
  requested: number;
  pageCount: number;
}

function scrollPdfPage({ container, requested, pageCount }: PdfPageScrollOptions) {
  const page = Math.max(1, Math.min(pageCount, Math.trunc(requested)));
  const target = container?.querySelector<HTMLElement>(`[data-cy="pdf-page-${page}"]`);
  if (!container || !target || !Number.isFinite(requested)) return null;
  container.scrollTo({
    top:
      container.scrollTop +
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      16,
    behavior: 'instant',
  });
  return page;
}

function getVisiblePdfPage(container: HTMLDivElement | null, pageCount: number) {
  if (!container) return;
  if (
    container.scrollTop > 0 &&
    container.scrollHeight - container.scrollTop - container.clientHeight <= 2
  )
    return pageCount;
  const anchor = container.getBoundingClientRect().top + 24;
  const pages = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
  const visible = Array.from(pages).find(page => page.getBoundingClientRect().bottom > anchor);
  if (visible) return Number(visible.dataset.pdfPage);
}

export function usePdfNavigation(scrollRef: RefObject<HTMLDivElement | null>) {
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const frame = useRef(0);
  const goToPage = useCallback(
    (requested: number) => {
      const page = scrollPdfPage({
        container: scrollRef.current,
        requested,
        pageCount,
      });
      if (page !== null) setPageNumber(page);
    },
    [pageCount, scrollRef]
  );
  const onScroll = useCallback(() => {
    window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      const page = getVisiblePdfPage(scrollRef.current, pageCount);
      if (page !== undefined) setPageNumber(page);
    });
  }, [pageCount, scrollRef]);
  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);
  return { pageCount, pageNumber, setPageCount, goToPage, onScroll };
}
