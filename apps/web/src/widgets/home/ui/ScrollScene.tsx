'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { useSceneProgress } from '../model/useSceneProgress';

export function ScrollScene({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasRoom, setHasRoom] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-height: 641px)');
    const sync = () => setHasRoom(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  const { allowRichEffects, isDesktopViewport } = usePerformanceMode();
  const enabled = allowRichEffects && isDesktopViewport && hasRoom;
  useSceneProgress(ref, enabled);
  return <div ref={ref} className={className} data-enhanced={enabled} data-scroll-scene>{children}</div>;
}
