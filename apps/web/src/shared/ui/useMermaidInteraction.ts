'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type MermaidRenderState = 'loading' | 'rendered' | 'error';

const MIN_SCALE = 0.15;
const MAX_SCALE = 4;
const PADDING = 32; // px-4 sm:px-6 가로 패딩 근사치

/**
 * Mermaid 다이어그램의 휠 줌(커서 중심) · 드래그/핀치 패닝 · 컨테이너 폭 자동 피팅을 담당.
 * renderState가 'rendered'가 될 때 컨테이너 폭에 맞춰 초기 스케일을 잡고, 'loading'이면 리셋한다.
 */
export function useMermaidInteraction(renderState: MermaidRenderState) {
  const [dragging, setDragging] = useState(false);
  const [tf, setTf] = useState({ s: 1, x: 0, y: 0 });
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const commit = useCallback((s: number, x: number, y: number) => {
    scaleRef.current = s;
    txRef.current = x;
    tyRef.current = y;
    setTf({ s, x, y });
  }, []);

  const reset = useCallback(() => commit(1, 0, 0), [commit]);

  // 한 점(cx, cy)을 기준으로 factor만큼 확대/축소
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scaleRef.current * factor));
    const r = ns / scaleRef.current;
    commit(ns, cx + r * (txRef.current - cx), cy + r * (tyRef.current - cy));
  }, [commit]);

  // 새 렌더 시작 시 리셋
  useEffect(() => {
    if (renderState === 'loading') {
      setContainerHeight(undefined);
      commit(1, 0, 0);
    }
  }, [renderState, commit]);

  // 자동 피팅: SVG가 컨테이너보다 넓으면 폭에 맞춰 축소하고 높이를 확정
  useEffect(() => {
    if (renderState !== 'rendered') return;
    const raf = requestAnimationFrame(() => {
      if (!containerRef.current || !contentRef.current) return;
      const svgEl = contentRef.current.querySelector('svg');
      if (!svgEl) return;

      const containerW = containerRef.current.clientWidth - PADDING;
      const { width: svgW, height: svgH } = svgEl.getBoundingClientRect();

      if (svgW > containerW) {
        const fitScale = containerW / svgW;
        commit(fitScale, 0, 0);
        setContainerHeight(Math.ceil(svgH * fitScale) + 40);
      } else {
        setContainerHeight(Math.ceil(svgH) + 40);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [renderState, commit]);

  // 휠 줌 (커서 중심)
  useEffect(() => {
    if (renderState !== 'rendered') return;
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [renderState, zoomAt]);

  // 터치 핀치 줌 + 한 손가락 패닝
  useEffect(() => {
    if (renderState !== 'rendered') return;
    const el = containerRef.current;
    if (!el) return;

    let lastDist: number | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const [t1, t2] = Array.from(e.touches);
        lastDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      } else if (e.touches.length === 1) {
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastDist = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && lastDist !== null) {
        const [t1, t2] = Array.from(e.touches);
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const rect = el.getBoundingClientRect();
        const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
        zoomAt(dist / lastDist, midX, midY);
        lastDist = dist;
      } else if (e.touches.length === 1 && lastDist === null) {
        const dx = e.touches[0].clientX - lastPos.current.x;
        const dy = e.touches[0].clientY - lastPos.current.y;
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        commit(scaleRef.current, txRef.current + dx, tyRef.current + dy);
      }
    };

    const onTouchEnd = () => { lastDist = null; };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [renderState, zoomAt, commit]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    commit(scaleRef.current, txRef.current + dx, tyRef.current + dy);
  }, [commit]);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
  }, []);

  const isTransformed = tf.s !== 1 || tf.x !== 0 || tf.y !== 0;

  return {
    containerRef,
    contentRef,
    transform: tf,
    dragging,
    containerHeight,
    isTransformed,
    reset,
    onMouseDown,
    onMouseMove,
    stopDrag,
  };
}
