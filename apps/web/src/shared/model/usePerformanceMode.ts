'use client';

import { useSyncExternalStore } from 'react';

type PerformanceSnapshot = {
  hasResolved: boolean;
  isTouchDevice: boolean;
  isMobileViewport: boolean;
  isDesktopViewport: boolean;
  supportsHover: boolean;
  prefersReducedMotion: boolean;
  usesSoftwareRendering: boolean;
};

const initialSnapshot: PerformanceSnapshot = {
  hasResolved: false,
  isTouchDevice: true,
  isMobileViewport: true,
  isDesktopViewport: false,
  supportsHover: false,
  prefersReducedMotion: false,
  usesSoftwareRendering: false,
};

const SOFTWARE_RENDERER_MARKERS = [
  'swiftshader',
  'llvmpipe',
  'software rasterizer',
  'microsoft basic render driver',
];

let snapshot = initialSnapshot;
let isStoreInitialized = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function updateSnapshot(nextSnapshot: PerformanceSnapshot) {
  if (
    snapshot.hasResolved === nextSnapshot.hasResolved &&
    snapshot.isTouchDevice === nextSnapshot.isTouchDevice &&
    snapshot.isMobileViewport === nextSnapshot.isMobileViewport &&
    snapshot.isDesktopViewport === nextSnapshot.isDesktopViewport &&
    snapshot.supportsHover === nextSnapshot.supportsHover &&
    snapshot.prefersReducedMotion === nextSnapshot.prefersReducedMotion &&
    snapshot.usesSoftwareRendering === nextSnapshot.usesSoftwareRendering
  ) {
    return;
  }

  snapshot = nextSnapshot;
  emitChange();
}

function detectSoftwareRendering() {
  try {
    const canvas = document.createElement('canvas');
    const context = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!context) return true;

    const rendererInfo = context.getExtension('WEBGL_debug_renderer_info');
    if (!rendererInfo) return false;

    const renderer = String(
      context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)
    ).toLowerCase();

    return SOFTWARE_RENDERER_MARKERS.some(marker => renderer.includes(marker));
  } catch {
    // 렌더러 정보를 숨기는 브라우저에서는 기존 시각 효과를 유지한다.
    return false;
  }
}

function ensureStore() {
  if (isStoreInitialized || typeof window === 'undefined') {
    return;
  }

  isStoreInitialized = true;

  const touchQuery = window.matchMedia('(pointer: coarse), (hover: none)');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const usesSoftwareRendering = detectSoftwareRendering();

  const syncSnapshot = () => {
    updateSnapshot({
      hasResolved: true,
      isTouchDevice: touchQuery.matches,
      isMobileViewport: mobileQuery.matches,
      isDesktopViewport: desktopQuery.matches,
      supportsHover: hoverQuery.matches,
      prefersReducedMotion: motionQuery.matches,
      usesSoftwareRendering,
    });
  };

  syncSnapshot();

  touchQuery.addEventListener('change', syncSnapshot);
  mobileQuery.addEventListener('change', syncSnapshot);
  desktopQuery.addEventListener('change', syncSnapshot);
  hoverQuery.addEventListener('change', syncSnapshot);
  motionQuery.addEventListener('change', syncSnapshot);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureStore();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return initialSnapshot;
}

export function usePerformanceMode() {
  const {
    hasResolved,
    isTouchDevice,
    isMobileViewport,
    isDesktopViewport,
    supportsHover,
    prefersReducedMotion,
    usesSoftwareRendering,
  } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const reduceMotion = !hasResolved || prefersReducedMotion;
  const reduceVisualEffects = reduceMotion || usesSoftwareRendering;
  const allowRichEffects = hasResolved && !reduceVisualEffects;

  return {
    reduceMotion,
    reduceVisualEffects,
    allowRichEffects,
    isTouchDevice,
    isMobileViewport,
    isDesktopViewport,
    supportsHover,
    prefersReducedMotion,
    usesSoftwareRendering,
  };
}
