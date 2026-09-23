'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import styles from './heroScroll.module.css';

interface HeroScrollArtworkProps {
  children: ReactNode;
  className?: string;
}

/** 읽는 흐름은 그대로 두고 장식만 스크롤을 따라 조금 떠오르게 한다. */
export function HeroScrollArtwork({ children, className }: HeroScrollArtworkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { allowRichEffects } = usePerformanceMode();

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest('section');
    if (!element || !section || !allowRichEffects) return;

    let frame = 0;
    let isVisible = false;
    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (64 - bounds.top) / Math.max(1, bounds.height * 0.85)));
      element.style.setProperty('--hero-art-progress', progress.toFixed(4));
    };
    const scheduleUpdate = () => {
      if (isVisible && !document.hidden && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      element.dataset.motion = String(isVisible);
      scheduleUpdate();
    });
    observer.observe(section);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    document.addEventListener('visibilitychange', scheduleUpdate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      document.removeEventListener('visibilitychange', scheduleUpdate);
      element.style.removeProperty('--hero-art-progress');
      delete element.dataset.motion;
    };
  }, [allowRichEffects]);

  return (
    <div ref={ref} className={`${styles.artwork} ${className ?? ''}`} data-testid="hero-artwork" aria-hidden="true">
      {children}
    </div>
  );
}
