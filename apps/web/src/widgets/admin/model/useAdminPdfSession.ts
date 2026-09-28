'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { flushSync } from 'react-dom';
import { useAuthStore } from '@/entities/user';
import { verifyAdminDocumentSession } from '../api/adminDocumentsApi';

const SESSION_ERROR = '관리자 로그인 상태를 확인하지 못했습니다. 다시 확인해 주세요.';
const SESSION_TIMEOUT_MS = 10_000;

interface PdfSessionState {
  isActive: boolean;
  error: string;
}

interface PdfSessionRuntime {
  isMounted: boolean;
  ownerId: string;
  controller: AbortController | null;
  timeout: number | null;
  update: (state: PdfSessionState) => void;
}

function cancelSessionRequest(runtime: PdfSessionRuntime) {
  if (runtime.timeout !== null) window.clearTimeout(runtime.timeout);
  runtime.timeout = null;
  runtime.controller?.abort();
  runtime.controller = null;
}

function isCurrentRequest(runtime: PdfSessionRuntime, controller: AbortController) {
  const user = useAuthStore.getState().user;
  return (
    runtime.isMounted &&
    runtime.controller === controller &&
    !controller.signal.aborted &&
    user?.id === runtime.ownerId &&
    user.role === 'ADMIN'
  );
}

function pauseSession(runtime: PdfSessionRuntime, error = '') {
  cancelSessionRequest(runtime);
  if (!runtime.isMounted) return;
  // 브라우저가 비공개 화면을 복원용 스냅샷으로 보관하기 전에 캔버스와 작업을 정리한다.
  flushSync(() => runtime.update({ isActive: false, error }));
}

function verifySession(runtime: PdfSessionRuntime) {
  cancelSessionRequest(runtime);
  if (!runtime.isMounted) return;
  runtime.update({ isActive: false, error: '' });
  const user = useAuthStore.getState().user;
  if (document.visibilityState !== 'visible') return;
  if (!runtime.ownerId || user?.id !== runtime.ownerId || user.role !== 'ADMIN') {
    runtime.update({ isActive: false, error: SESSION_ERROR });
    return;
  }
  const controller = new AbortController();
  runtime.controller = controller;
  runtime.timeout = window.setTimeout(() => {
    if (!isCurrentRequest(runtime, controller)) return;
    controller.abort();
    runtime.update({ isActive: false, error: SESSION_ERROR });
  }, SESSION_TIMEOUT_MS);
  void verifyAdminDocumentSession(controller.signal)
    .then(verifiedUser => {
      if (!isCurrentRequest(runtime, controller)) return;
      const isActive =
        verifiedUser.id === runtime.ownerId &&
        verifiedUser.role === 'ADMIN' &&
        document.visibilityState === 'visible';
      runtime.update({ isActive, error: isActive ? '' : SESSION_ERROR });
    })
    .catch(() => {
      if (isCurrentRequest(runtime, controller))
        runtime.update({ isActive: false, error: SESSION_ERROR });
    })
    .finally(() => {
      if (runtime.controller !== controller) return;
      if (runtime.timeout !== null) window.clearTimeout(runtime.timeout);
      runtime.timeout = null;
      runtime.controller = null;
    });
}

function readStoredOwner(value: string | null): string | null | undefined {
  if (value === null) return null;
  try {
    const payload: unknown = JSON.parse(value);
    if (!payload || typeof payload !== 'object' || !('state' in payload)) return undefined;
    const state = payload.state;
    if (!state || typeof state !== 'object' || !('user' in state)) return undefined;
    if (state.user === null) return null;
    if (
      typeof state.user === 'object' &&
      state.user &&
      'id' in state.user &&
      typeof state.user.id === 'string'
    )
      return state.user.id;
  } catch {
    // 손상된 저장소 값은 권한 근거로 삼지 않고 서버에서 다시 확인한다.
  }
  return undefined;
}

function handleStoredSession(runtime: PdfSessionRuntime, event: StorageEvent) {
  if (event.key !== null && event.key !== 'auth-storage') return;
  const ownerId = event.key === null ? null : readStoredOwner(event.newValue);
  if (ownerId === null || (ownerId !== undefined && ownerId !== runtime.ownerId)) {
    pauseSession(runtime);
    // 다른 탭의 명시적인 로그아웃·계정 변경만 현재 사용자 상태에서도 반영한다.
    useAuthStore.getState().setUser(null);
    return;
  }
  verifySession(runtime);
}

function usePdfSessionEvents(runtimeRef: MutableRefObject<PdfSessionRuntime>, ownerId: string) {
  useEffect(() => {
    const runtime = runtimeRef.current;
    runtime.isMounted = true;
    runtime.ownerId = ownerId;
    const verify = () => verifySession(runtime);
    const hide = () => pauseSession(runtime);
    const show = (event: PageTransitionEvent) => {
      if (event.persisted) verify();
    };
    const visibility = () => {
      if (document.visibilityState === 'visible') verify();
      else hide();
    };
    const storage = (event: StorageEvent) => handleStoredSession(runtime, event);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', show);
    window.addEventListener('focus', verify);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visibility);
    verify();
    return () => {
      runtime.isMounted = false;
      cancelSessionRequest(runtime);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', show);
      window.removeEventListener('focus', verify);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [ownerId, runtimeRef]);
}

export function useAdminPdfSession() {
  const ownerId = useAuthStore(state => state.user?.id ?? '');
  const [state, setState] = useState<PdfSessionState>({ isActive: false, error: '' });
  const runtime = useRef<PdfSessionRuntime>({
    isMounted: false,
    ownerId,
    controller: null,
    timeout: null,
    update: setState,
  });
  usePdfSessionEvents(runtime, ownerId);
  const retrySession = useCallback(() => verifySession(runtime.current), []);
  return { ...state, retrySession };
}
