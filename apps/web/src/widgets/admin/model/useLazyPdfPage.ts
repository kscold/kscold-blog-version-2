'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';

interface LazyPdfPageOptions {
  width: number;
  rotation: number;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function useLazyPdfPage({ width, rotation, scrollRef }: LazyPdfPageOptions) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(Math.SQRT2);
  const [intrinsicRotation, setIntrinsicRotation] = useState(0);
  const [hasError, setHasError] = useState(false);
  const height = width * (rotation % 180 ? 1 / aspectRatio : aspectRatio);
  useEffect(() => {
    const node = pageRef.current;
    if (!node || !scrollRef.current) return;
    // 긴 이력서도 근처 페이지만 캔버스·텍스트 레이어를 유지한다.
    const observer = new IntersectionObserver(([entry]) => setIsNear(entry.isIntersecting), {
      root: scrollRef.current,
      rootMargin: '800px 0px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollRef]);
  function onLoad(page: PDFPageProxy) {
    const viewport = page.getViewport({ scale: 1 });
    setAspectRatio(viewport.height / viewport.width);
    setIntrinsicRotation(page.rotate);
    setHasError(false);
  }
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    2,
    Math.sqrt(4_000_000 / (width * height))
  );
  return {
    pageRef,
    isNear,
    height,
    intrinsicRotation,
    hasError,
    onLoad,
    pixelRatio,
    onError: () => setHasError(true),
  };
}

export type LazyPdfPageState = ReturnType<typeof useLazyPdfPage>;
