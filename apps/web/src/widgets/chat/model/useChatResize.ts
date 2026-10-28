'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';

type Size = { width: number; height: number };
type Bounds = { top: number; left: number; right: number; bottom: number };
export type ResizeEdge = 'top' | 'left' | 'corner';
const STORAGE_KEY = 'kscold-chat-size';
const MAXIMIZED_KEY = 'kscold-chat-maximized';
const GAP = 16;

function saveMaximized(maximized: boolean) {
  try {
    if (maximized) window.localStorage.setItem(MAXIMIZED_KEY, '1');
    else window.localStorage.removeItem(MAXIMIZED_KEY);
  } catch {
    // 저장소가 차단되어도 현재 창의 최대화는 유지한다.
  }
}

function visibleRect(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).display !== 'none' ? rect : null;
}

// 최대화는 사이트 헤더 아래, 데스크톱 사이드바 오른쪽의 본문 영역을 가득 채운다.
function maximizedBounds(): Bounds {
  const header = visibleRect('[data-chat-maximize-top]');
  const sidebar = visibleRect('[data-chat-maximize-left]');
  return {
    top: Math.max(GAP / 2, (header?.bottom ?? 0) + GAP / 2),
    left: sidebar && sidebar.right < window.innerWidth / 2 ? sidebar.right + GAP : GAP,
    right: GAP,
    bottom: GAP,
  };
}

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
  // 스크롤바 예약 공간을 제외한 실제 고정 위치를 기준으로 왼쪽 여백을 지킨다.
  const maxWidth = Math.max(1, panel.getBoundingClientRect().right - 16);
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
  const [maximized, setMaximized] = useState<Bounds | null>(null);
  const isMaximized = useRef(false);
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
    try {
      isMaximized.current = window.localStorage.getItem(MAXIMIZED_KEY) === '1';
    } catch {
      isMaximized.current = false;
    }
    const update = () => {
      if (!panel.current || window.innerWidth < 640) {
        setMaximized(null);
        return;
      }
      setMaximized(isMaximized.current ? maximizedBounds() : null);
      if (currentSize.current) {
        currentSize.current = clampSize(currentSize.current, panel.current);
        setSize(currentSize.current);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      drag.current = null;
      document.documentElement.removeAttribute('data-chat-resizing');
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
    isMaximized.current = false;
    setMaximized(null);
    saveMaximized(false);
  }

  function toggleMaximize() {
    if (!panel.current || window.innerWidth < 640) return;
    isMaximized.current = !isMaximized.current;
    setMaximized(isMaximized.current ? maximizedBounds() : null);
    saveMaximized(isMaximized.current);
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, edge: ResizeEdge) {
    if (event.button !== 0 || !panel.current || window.innerWidth < 640 || isMaximized.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const { width, height } = panel.current.getBoundingClientRect();
    drag.current = { edge, x: event.clientX, y: event.clientY, size: { width, height }, pointerId: event.pointerId };
    // 끄는 동안 포인터가 손잡이를 벗어나도 커서와 텍스트 선택 방지를 유지한다.
    document.documentElement.setAttribute('data-chat-resizing', edge);
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
    document.documentElement.removeAttribute('data-chat-resizing');
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
    if (!panel.current || window.innerWidth < 640 || isMaximized.current) return;
    const step = event.shiftKey ? 48 : 16;
    const dx = edge !== 'top' ? (event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0) : 0;
    const dy = edge !== 'left' ? (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    const { width, height } = panel.current.getBoundingClientRect();
    applySize({ width: width + dx, height: height + dy });
    saveSize(currentSize.current);
  }

  const style = (maximized
    ? { ...maximized, width: 'auto', height: 'auto', maxWidth: 'none', maxHeight: 'none' }
    : size ? { '--chat-width': `${size.width}px`, '--chat-height': `${size.height}px` } : {}) as CSSProperties;
  return {
    style,
    isMaximized: !!maximized,
    isCustomSize: !!size || !!maximized,
    reset,
    toggleMaximize,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    onKeyDown,
  };
}
