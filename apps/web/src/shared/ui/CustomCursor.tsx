'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const ACTIVE_CURSOR_CLASS = 'custom-cursor-active';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
    const shouldUseCustomCursor = () => mediaQuery.matches;

    const updatePosition = (e: MouseEvent) => {
      if (!shouldUseCustomCursor()) return;
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const updateHoverState = (e: MouseEvent) => {
      if (!shouldUseCustomCursor()) {
        setIsHovering(false);
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(shouldUseCustomCursor());
    };

    const syncCursorMode = () => {
      const isEnabled = shouldUseCustomCursor();

      html.classList.toggle(ACTIVE_CURSOR_CLASS, isEnabled);
      setIsVisible(isEnabled);

      if (!isEnabled) {
        setIsHovering(false);
        cursorX.set(-100);
        cursorY.set(-100);
      }
    };

    syncCursorMode();

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', updateHoverState);
    html.addEventListener('mouseleave', handleMouseLeave);
    html.addEventListener('mouseenter', handleMouseEnter);
    mediaQuery.addEventListener('change', syncCursorMode);

    return () => {
      html.classList.remove(ACTIVE_CURSOR_CLASS);
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', updateHoverState);
      html.removeEventListener('mouseleave', handleMouseLeave);
      html.removeEventListener('mouseenter', handleMouseEnter);
      mediaQuery.removeEventListener('change', syncCursorMode);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] h-[80px] w-[80px] rounded-full pointer-events-none mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
        // 하드웨어 가속과 안티앨리어싱을 강제로 유지
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        outline: '1px solid transparent',
      }}
      animate={{
        scale: isHovering ? 1 : 0.4,
        backgroundColor: isHovering ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        backgroundColor: { duration: 0.2 },
      }}
    />
  );
}
