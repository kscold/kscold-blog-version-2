'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

const ACTIVE_CURSOR_CLASS = 'custom-cursor-active';

interface CustomCursorProps {
  useHomeContrast?: boolean;
}

export function CustomCursor({ useHomeContrast = false }: CustomCursorProps) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const { allowRichEffects } = usePerformanceMode();

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const mediaQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (min-width: 768px)'
    );
    const shouldUseCustomCursor = () => allowRichEffects && mediaQuery.matches;
    let animationFrame: number | null = null;
    let nextPosition = { x: -100, y: -100 };

    const flushPosition = () => {
      cursorX.set(nextPosition.x);
      cursorY.set(nextPosition.y);
      animationFrame = null;
    };

    const updatePosition = (e: MouseEvent) => {
      if (!shouldUseCustomCursor()) return;
      nextPosition = { x: e.clientX, y: e.clientY };
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(flushPosition);
      }
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
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      html.classList.remove(ACTIVE_CURSOR_CLASS);
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', updateHoverState);
      html.removeEventListener('mouseleave', handleMouseLeave);
      html.removeEventListener('mouseenter', handleMouseEnter);
      mediaQuery.removeEventListener('change', syncCursorMode);
    };
  }, [allowRichEffects, cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed top-0 left-0 z-[9999] h-[80px] w-[80px] rounded-full pointer-events-none ${
        useHomeContrast ? 'mix-blend-normal' : 'mix-blend-difference'
      }`}
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
        // 일반 GPU 환경에서 기존 커서의 가장자리 품질을 유지한다.
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        outline: '1px solid transparent',
      }}
      animate={{
        scale: isHovering ? 1 : 0.4,
        backgroundColor: useHomeContrast
          ? isHovering
            ? 'rgba(71, 71, 71, 0.72)'
            : 'rgba(71, 71, 71, 0.46)'
          : isHovering
            ? 'rgba(255, 255, 255, 1)'
            : 'rgba(255, 255, 255, 0.4)',
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        backgroundColor: { duration: 0.2 },
      }}
    />
  );
}
