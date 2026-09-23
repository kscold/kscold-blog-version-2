'use client';

import { useEffect, useState } from 'react';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import styles from './homeExperience.module.css';

/** 로딩률이 아닌 짧은 인트로 카운터다. 콘텐츠와 입력을 절대 가리지 않는다. */
export function HomeArrival() {
  const { allowRichEffects } = usePerformanceMode();
  const [progress, setProgress] = useState<number | null>(null);
  useEffect(() => {
    if (!allowRichEffects) return;
    try {
      if (sessionStorage.getItem('kscold-home-intro')) return;
      sessionStorage.setItem('kscold-home-intro', 'seen');
    } catch { return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const value = Math.min(100, Math.floor((now - start) / 10));
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const timer = window.setTimeout(() => setProgress(null), 1400);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [allowRichEffects]);
  return progress === null || !allowRichEffects ? null : <span className={styles.arrival} aria-hidden="true">HELLO, WORLD / {String(progress).padStart(3, '0')}</span>;
}
