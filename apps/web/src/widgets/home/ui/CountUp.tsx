'use client';

import { useEffect, useRef } from 'react';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { allowRichEffects } = usePerformanceMode();
  useEffect(() => {
    const element = ref.current;
    if (!element || !allowRichEffects) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1100);
        element.textContent = Math.round(value * (1 - (1 - progress) ** 3)).toLocaleString('ko-KR');
        if (progress < 1 && !document.hidden) frame = requestAnimationFrame(tick);
        else element.textContent = value.toLocaleString('ko-KR');
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); element.textContent = value.toLocaleString('ko-KR'); };
  }, [value, allowRichEffects]);
  return <span aria-label={value.toLocaleString('ko-KR')}><span ref={ref} aria-hidden="true">{value.toLocaleString('ko-KR')}</span></span>;
}
