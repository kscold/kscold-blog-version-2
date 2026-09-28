'use client';

import { useEffect, type RefObject } from 'react';

interface PinchOptions {
  scrollRef: RefObject<HTMLDivElement | null>;
  scale: number;
  onScale: (scale: number) => void;
}

interface PinchHandlerOptions {
  container: HTMLDivElement;
  scale: number;
  onScale: (scale: number) => void;
}

export function clampPdfScale(scale: number) {
  return Math.max(0.5, Math.min(2.5, Math.round(scale * 100) / 100));
}

function getTouchDistance(touches: TouchList) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}

function createPinchHandlers({ container, scale, onScale }: PinchHandlerOptions) {
  let initialDistance = 0;
  let nextScale = scale;
  const reset = () => {
    const stage = container.querySelector<HTMLElement>('.react-pdf__Document');
    if (stage) {
      stage.style.transform = '';
      stage.style.transformOrigin = '';
    }
    initialDistance = 0;
  };
  const start = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      initialDistance = getTouchDistance(event.touches);
      nextScale = scale;
    }
  };
  const move = (event: TouchEvent) => {
    if (event.touches.length !== 2 || !initialDistance) return;
    event.preventDefault();
    nextScale = clampPdfScale((scale * getTouchDistance(event.touches)) / initialDistance);
    const stage = container.querySelector<HTMLElement>('.react-pdf__Document');
    // 손가락 이동 중에는 캔버스를 다시 만들지 않고 손을 떼었을 때 선명하게 재렌더링한다.
    if (stage) {
      stage.style.transformOrigin = `50% ${container.scrollTop + container.clientHeight / 2}px`;
      stage.style.transform = `scale(${nextScale / scale})`;
    }
  };
  const end = () => {
    if (initialDistance) {
      reset();
      onScale(nextScale);
    }
  };
  return { start, move, end, reset };
}

export function usePdfPinchZoom({ scrollRef, scale, onScale }: PinchOptions) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { start, move, end, reset } = createPinchHandlers({ container, scale, onScale });
    container.addEventListener('touchstart', start, { passive: true });
    container.addEventListener('touchmove', move, { passive: false });
    container.addEventListener('touchend', end);
    container.addEventListener('touchcancel', reset);
    return () => {
      container.removeEventListener('touchstart', start);
      container.removeEventListener('touchmove', move);
      container.removeEventListener('touchend', end);
      container.removeEventListener('touchcancel', reset);
      reset();
    };
  }, [scrollRef, scale, onScale]);
}
