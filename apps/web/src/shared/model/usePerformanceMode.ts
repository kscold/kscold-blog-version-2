'use client';

import { useSyncExternalStore } from 'react';

type PerformanceSnapshot = {
  hasResolved: boolean;
  isTouchDevice: boolean;
  isMobileViewport: boolean;
  supportsHover: boolean;
  prefersReducedMotion: boolean;
};

const initialSnapshot: PerformanceSnapshot = {
  hasResolved: false,
  isTouchDevice: true,
  isMobileViewport: true,
  supportsHover: false,
  prefersReducedMotion: false,
};

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
    snapshot.supportsHover === nextSnapshot.supportsHover &&
    snapshot.prefersReducedMotion === nextSnapshot.prefersReducedMotion
  ) {
    return;
  }

  snapshot = nextSnapshot;
  emitChange();
}

function ensureStore() {
  if (isStoreInitialized || typeof window === 'undefined') {
    return;
  }

  isStoreInitialized = true;

  const touchQuery = window.matchMedia('(pointer: coarse), (hover: none)');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const syncSnapshot = () => {
    updateSnapshot({
      hasResolved: true,
      isTouchDevice: touchQuery.matches,
      isMobileViewport: mobileQuery.matches,
      supportsHover: hoverQuery.matches,
      prefersReducedMotion: motionQuery.matches,
    });
  };

  syncSnapshot();

  touchQuery.addEventListener('change', syncSnapshot);
  mobileQuery.addEventListener('change', syncSnapshot);
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
    supportsHover,
    prefersReducedMotion,
  } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const reduceMotion = !hasResolved || prefersReducedMotion || isTouchDevice;
  const allowRichEffects = hasResolved && !reduceMotion && !isMobileViewport;

  return {
    reduceMotion,
    allowRichEffects,
    isTouchDevice,
    isMobileViewport,
    supportsHover,
  };
}
