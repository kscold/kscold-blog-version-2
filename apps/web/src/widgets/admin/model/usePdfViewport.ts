'use client';

import { useEffect, useState, type RefObject } from 'react';

export function usePdfViewport(scrollRef: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(320);
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const update = () => setWidth(Math.max(200, Math.min(920, container.clientWidth - 32)));
    const observer = new ResizeObserver(update);
    update();
    observer.observe(container);
    return () => observer.disconnect();
  }, [scrollRef]);
  return width;
}
