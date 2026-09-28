'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/entities/user';
import { verifyAdminDocumentSession } from '../api/adminDocumentsApi';

export function useAdminDocumentIdentity() {
  const user = useAuthStore(state => state.user);
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const setUser = useAuthStore(state => state.setUser);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const hasHadUser = useRef(false);
  const consumedRetry = useRef(0);

  useEffect(() => {
    if (!hasHydrated) return;
    if (user) {
      hasHadUser.current = true;
      setIsVerifying(false);
      return;
    }
    const isManualRetry = retry !== consumedRetry.current;
    if (hasHadUser.current && !isManualRetry) return;
    consumedRetry.current = retry;
    const controller = new AbortController();
    let hasTimedOut = false;
    const timeout = window.setTimeout(() => {
      hasTimedOut = true;
      controller.abort();
    }, 10_000);
    setIsVerifying(true);
    setError('');
    void verifyAdminDocumentSession(controller.signal)
      .then(verifiedUser => {
        if (!controller.signal.aborted) setUser(verifiedUser);
      })
      .catch(cause => {
        if (!controller.signal.aborted || hasTimedOut) {
          setError(
            hasTimedOut
              ? '로그인 상태 확인이 지연되고 있습니다. 다시 확인해 주세요.'
              : cause instanceof Error
                ? cause.message
                : '관리자 권한을 확인하지 못했습니다.'
          );
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!controller.signal.aborted || hasTimedOut) setIsVerifying(false);
      });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [hasHydrated, user, retry, setUser]);

  return { user, hasHydrated, isVerifying, error, verifyAgain: () => setRetry(value => value + 1) };
}
