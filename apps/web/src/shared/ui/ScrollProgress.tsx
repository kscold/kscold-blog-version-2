'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function ScrollProgress() {
  const { reduceMotion, isTouchDevice } = usePerformanceMode();
  const { scrollYProgress } = useScroll();

  // 스크롤 진행률 바 부드럽게 처리
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduceMotion || isTouchDevice) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-surface-900 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}
