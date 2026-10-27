'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';

type Size = { width: number; height: number };
export type ResizeEdge = 'top' | 'left' | 'corner';
const STORAGE_KEY = 'kscold-chat-size';

function saveSize(size: Size | null) {
  try {
    if (size) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소가 차단되어도 현재 창의 크기 조절은 계속 제공한다.
  }
}

function clampSize(size: Size, panel: HTMLDivElement): Size {
  const style = window.getComputedStyle(panel);
  const maxWidth = Math.max(1, window.innerWidth - 32);
  const maxHeight = Math.max(1, Math.min(
    window.innerHeight - (parseFloat(style.bottom) || 0) - 8,
    parseFloat(style.maxHeight) || window.innerHeight
  ));
  return {
    width: Math.min(maxWidth, Math.max(Math.min(360, maxWidth), size.width)),
    height: Math.min(maxHeight, Math.max(Math.min(420, maxHeight), size.height)),
  };
}

export function useChatResize(isOpen: boolean, panel: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<Size | null>(null);
  const currentSize = useRef<Size | null>(null);
  const drag = useRef<{ edge: ResizeEdge; x: number; y: number; size: Size; pointerId: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored && Number.isFinite(stored.width) && Number.isFinite(stored.height) &&
          stored.width > 0 && stored.height > 0) currentSize.current = stored;
    } catch {
      // 잘못된 저장 값은 기본 크기로 연다.
    }
    const update = () => {
      if (!panel.current || window.innerWidth < 640) return;
      if (currentSize.current) {
        currentSize.current = clampSize(currentSize.current, panel.current);
        setSize(currentSize.current);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      drag.current = null;
      window.removeEventListener('resize', update);
    };
  }, [isOpen, panel]);

  function applySize(next: Size) {
    if (!panel.current || window.innerWidth < 640) return;
    currentSize.current = clampSize(next, panel.current);
    setSize(currentSize.current);
  }

  function reset() {
    drag.current = null;
    currentSize.current = null;
    setSize(null);
    saveSize(null);
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, edge: ResizeEdge) {
    if (event.button !== 0 || !panel.current || window.innerWidth < 640) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const { width, height } = panel.current.getBoundingClientRect();
    drag.current = { edge, x: event.clientX, y: event.clientY, size: { width, height }, pointerId: event.pointerId };
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start || start.pointerId !== event.pointerId) return;
    applySize({
      width: start.size.width + (start.edge === 'top' ? 0 : start.x - event.clientX),
      height: start.size.height + (start.edge === 'left' ? 0 : start.y - event.clientY),
    });
  }

  function onPointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    saveSize(currentSize.current);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, edge: ResizeEdge) {
    if (event.key === 'Home') {
      event.preventDefault();
      reset();
      return;
    }
    if (!panel.current || window.innerWidth < 640) return;
    const step = event.shiftKey ? 48 : 16;
    const dx = edge !== 'top' ? (event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0) : 0;
    const dy = edge !== 'left' ? (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    const { width, height } = panel.current.getBoundingClientRect();
    applySize({ width: width + dx, height: height + dy });
    saveSize(currentSize.current);
  }

  const style = size ? { '--chat-width': `${size.width}px`, '--chat-height': `${size.height}px` } as CSSProperties : {};
  return { style, reset, onPointerDown, onPointerMove, onPointerEnd, onKeyDown };
}
