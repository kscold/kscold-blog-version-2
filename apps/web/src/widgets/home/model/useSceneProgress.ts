'use client';

import { useEffect, type RefObject } from 'react';

/** 화면에 있는 구간만 프레임당 한 번 계산하며 브라우저 스크롤 자체는 가로채지 않는다. */
export function useSceneProgress(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight + 64);
      const progress = Math.min(1, Math.max(0, (64 - rect.top) / distance));
      element.style.setProperty('--scene-progress', String(progress));
      element.dataset.step = String(Math.min(3, Math.floor(progress * 4)));
    };
    const schedule = () => { if (visible && !frame && !document.hidden) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: '100px' });
    observer.observe(element);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      element.style.removeProperty('--scene-progress');
      delete element.dataset.step;
    };
  }, [enabled, ref]);
}
