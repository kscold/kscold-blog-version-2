'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** 주소의 #12 같은 조각에서 시작할 슬라이드를 읽는다. 새로고침하거나 링크를 나눠도 같은 장에서 열린다. */
function slideFromHash() {
  const value = Number.parseInt(window.location.hash.replace('#', ''), 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function useSlideNavigation() {
  const [slide, setSlide] = useState(1);
  const [slideCount, setSlideCount] = useState(0);
  // 주소의 번호를 읽기 전에 1번으로 주소를 덮어쓰지 않도록, 읽은 뒤부터 주소에 반영한다.
  const [hashRead, setHashRead] = useState(false);

  useEffect(() => {
    setSlide(slideFromHash());
    setHashRead(true);
    const onHashChange = () => setSlide(slideFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    // 넘길 때마다 방문 기록을 쌓지 않도록 현재 기록만 바꾼다.
    if (hashRead) window.history.replaceState(null, '', `#${slide}`);
  }, [hashRead, slide]);

  const clamp = useCallback(
    (target: number) =>
      Math.min(Math.max(1, Math.trunc(target)), slideCount || Math.max(1, target)),
    [slideCount]
  );

  const goTo = useCallback((target: number) => setSlide(clamp(target)), [clamp]);

  // 키를 빠르게 여러 번 눌러도 매번 바로 앞 결과에서 한 장씩 움직이게 한다.
  const move = useCallback((delta: number) => setSlide(current => clamp(current + delta)), [clamp]);

  const onLoaded = useCallback((count: number) => {
    setSlideCount(count);
    setSlide(current => Math.min(current, count));
  }, []);

  return { slide, slideCount, goTo, move, onLoaded };
}

/** 화면에 꽉 차게, 비율은 유지한 채 슬라이드 폭을 정한다. */
export function useStageFit(stageRef: RefObject<HTMLDivElement | null>, aspectRatio: number) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [stageRef]);

  const width = Math.floor(Math.min(size.width, size.height * aspectRatio));
  return { width, height: Math.floor(width / aspectRatio) };
}

interface SlideKeyOptions {
  goTo: (slide: number) => void;
  move: (delta: number) => void;
  slideCount: number;
  toggleFullscreen: () => void;
}

/** PowerPoint 슬라이드 쇼와 같은 키로 넘긴다. */
export function useSlideKeys({ goTo, move, slideCount, toggleFullscreen }: SlideKeyOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input')) return;
      // 버튼·링크에서 누른 Enter·스페이스는 그 요소의 동작으로 두어 두 장씩 넘어가지 않게 한다.
      // 방향키는 버튼을 누른 뒤 포커스가 남아 있어도 그대로 넘긴다.
      if (target?.closest('button, a') && (event.key === 'Enter' || event.key === ' ')) return;
      const forward = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'n'];
      const backward = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p'];
      if (forward.includes(event.key)) move(1);
      else if (backward.includes(event.key)) move(-1);
      else if (event.key === 'Home') goTo(1);
      else if (event.key === 'End' && slideCount) goTo(slideCount);
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goTo, move, slideCount, toggleFullscreen]);
}

/** 휴대폰에서는 옆으로 밀어 넘긴다. */
export function useSwipe(ref: RefObject<HTMLElement | null>, onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const onEnd = (event: TouchEvent) => {
      const origin = start.current;
      start.current = null;
      if (!origin) return;
      const dx = event.changedTouches[0].clientX - origin.x;
      const dy = event.changedTouches[0].clientY - origin.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
    };
    node.addEventListener('touchstart', onStart, { passive: true });
    node.addEventListener('touchend', onEnd);
    return () => {
      node.removeEventListener('touchstart', onStart);
      node.removeEventListener('touchend', onEnd);
    };
  }, [ref, onSwipe]);
}

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [ref]);

  const toggle = useCallback(() => {
    // 아이폰 사파리처럼 전체 화면을 지원하지 않는 브라우저에서는 화면 꽉 찬 상태 그대로 둔다.
    if (!ref.current?.requestFullscreen) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void ref.current.requestFullscreen().catch(() => undefined);
  }, [ref]);

  return {
    isFullscreen,
    toggle,
    isSupported: typeof document !== 'undefined' && document.fullscreenEnabled,
  };
}
