'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CURSOR_MEDIA_QUERY =
  '(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)';
const INTERACTIVE_SELECTOR =
  'a, button, summary, label, [role="button"], [data-cursor="interactive"], .interactive';
const FORM_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

type CursorMode = 'default' | 'interactive' | 'hidden';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const smoothX = useSpring(cursorX, { stiffness: 640, damping: 42, mass: 0.16 });
  const smoothY = useSpring(cursorY, { stiffness: 640, damping: 42, mass: 0.16 });

  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const visibleRef = useRef(false);
  const modeRef = useRef<CursorMode>('default');

  useEffect(() => {
    const mediaQuery = window.matchMedia(CURSOR_MEDIA_QUERY);
    let animationFrame: number | null = null;
    let pointerX = -100;
    let pointerY = -100;

    const updateVisibility = (visible: boolean) => {
      if (visibleRef.current === visible) return;
      visibleRef.current = visible;
      setIsVisible(visible);
    };

    const updateMode = (nextMode: CursorMode) => {
      if (modeRef.current === nextMode) return;
      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const flushPointerPosition = () => {
      cursorX.set(pointerX);
      cursorY.set(pointerY);
      animationFrame = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!mediaQuery.matches || event.pointerType === 'touch') return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      updateVisibility(true);

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(flushPointerPosition);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (!mediaQuery.matches) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(FORM_SELECTOR)) {
        updateMode('hidden');
        return;
      }

      updateMode(target.closest(INTERACTIVE_SELECTOR) ? 'interactive' : 'default');
    };

    const handlePointerDown = () => {
      if (mediaQuery.matches && modeRef.current !== 'hidden') setIsPressed(true);
    };

    const handlePointerUp = () => setIsPressed(false);

    const handlePointerLeave = () => {
      updateVisibility(false);
      setIsPressed(false);
    };

    const syncCursorMode = () => {
      if (mediaQuery.matches) return;

      updateVisibility(false);
      updateMode('default');
      setIsPressed(false);
      cursorX.set(-100);
      cursorY.set(-100);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);
    mediaQuery.addEventListener('change', syncCursorMode);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handlePointerLeave);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
      mediaQuery.removeEventListener('change', syncCursorMode);
    };
  }, [cursorX, cursorY]);

  if (!isVisible || mode === 'hidden') return null;

  const isInteractive = mode === 'interactive';

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[9999] h-6 w-6 rounded-full border transform-gpu will-change-transform [contain:strict] ${
        isInteractive
          ? 'border-surface-900/60 bg-surface-900/[0.045] shadow-[0_5px_20px_-12px_rgba(15,23,42,0.8)] dark:border-white/60 dark:bg-white/[0.06]'
          : 'border-surface-500/45 bg-white/[0.03] shadow-[0_4px_16px_-12px_rgba(15,23,42,0.7)] dark:border-white/40 dark:bg-surface-950/[0.03]'
      }`}
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={false}
      animate={{
        opacity: 1,
        scale: isPressed ? 0.82 : isInteractive ? 1.5 : 1,
      }}
      transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.18 }}
    >
      <span
        className={`absolute -right-[2px] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full transition-colors duration-200 ${
          isInteractive ? 'bg-surface-900 dark:bg-white' : 'bg-surface-500 dark:bg-surface-300'
        }`}
      />
    </motion.div>
  );
}
