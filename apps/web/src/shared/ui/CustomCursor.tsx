'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const CURSOR_MEDIA_QUERY =
  '(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)';
const INTERACTIVE_SELECTOR =
  'a, button, summary, label, [role="button"], [data-cursor="interactive"], .interactive';
const FORM_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

type CursorMode = 'default' | 'interactive' | 'hidden';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const visibleRef = useRef(false);
  const modeRef = useRef<CursorMode>('default');

  useEffect(() => {
    const mediaQuery = window.matchMedia(CURSOR_MEDIA_QUERY);

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

    const handlePointerMove = (event: PointerEvent) => {
      if (!mediaQuery.matches || event.pointerType === 'touch') return;

      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      updateVisibility(true);
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
      className={`pointer-events-none fixed left-0 top-0 z-[9999] h-2.5 w-2.5 rounded-full transform-gpu will-change-transform [contain:strict] ${
        isInteractive
          ? 'bg-surface-900/65 ring-1 ring-white/80 shadow-[0_3px_12px_-5px_rgba(15,23,42,0.7)] dark:bg-white/70 dark:ring-surface-950/70'
          : 'bg-surface-900/75 ring-1 ring-white/90 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.65)] dark:bg-white/80 dark:ring-surface-950/80'
      }`}
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={false}
      animate={{
        opacity: 1,
        scale: isPressed ? 0.8 : isInteractive ? 1.65 : 1,
      }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    />
  );
}
