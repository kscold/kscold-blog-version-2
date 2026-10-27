'use client';

import { useCallback, useSyncExternalStore } from 'react';

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** 서버 HTML과 첫 hydration을 맞추고 브라우저 전용 값을 읽을 시점을 제공한다. */
export function useHydrated() {
  return useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
}

/** 저장 공간을 외부 store로 구독한다. undefined는 접근 실패, null은 저장 값 없음이다. */
export function useStoredString(key: string) {
  const subscribe = useCallback((notify: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === key) notify();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);
  const getSnapshot = useCallback(() => {
    try { return localStorage.getItem(key); } catch { return undefined; }
  }, [key]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
