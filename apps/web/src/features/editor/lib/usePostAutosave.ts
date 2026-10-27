'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useHydrated, useStoredString } from '@/shared/lib/useBrowserSnapshot';
import type { PostFormData } from '../model/types';
import { readPostAutosave, type PostAutosave } from './postAutosave';

interface Options {
  autosaveKey: string;
  form: PostFormData;
  postId?: string;
  updatedAt?: string;
  dirty: boolean;
  enabled: boolean;
}

export function usePostAutosave({ autosaveKey, form, postId, updatedAt, dirty, enabled }: Options) {
  const [recovery, setRecovery] = useState<PostAutosave | null>(null);
  const [checkedKey, setCheckedKey] = useState('');
  const [lastSavedText, setLastSavedText] = useState<string | null>(null);
  const [restoredFromAutosave, setRestored] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useHydrated();
  const stored = useStoredString(autosaveKey);

  if (hydrated && checkedKey !== autosaveKey) {
    setCheckedKey(autosaveKey);
    let saved: PostAutosave | null = null;
    try {
      saved = stored ? readPostAutosave(stored) : null;
    } catch {
      // 손상된 브라우저 보관 값이 서버 원문과 작성기 진입을 막지 않게 한다.
    }
    setRecovery(saved && (!saved.postId || saved.postId === postId) ? saved : null);
    if (stored === undefined) {
      setLastSavedText('이 브라우저에서 임시 보관을 사용할 수 없습니다. 서버에 직접 저장해 주세요.');
    } else if (stored && !saved) {
      setLastSavedText('이 브라우저의 이전 임시 보관을 읽을 수 없습니다. 서버 원문은 유지됩니다.');
    }
  }
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!enabled || !dirty || recovery || checkedKey !== autosaveKey) return;
    timer.current = setTimeout(() => {
      try {
        const savedAt = new Date();
        localStorage.setItem(autosaveKey, JSON.stringify({
          version: 2, form, postId, updatedAt, savedAt: savedAt.toISOString(),
        }));
        setLastSavedText('이 브라우저에 임시 보관됨 · ' + savedAt.toLocaleTimeString('ko-KR'));
      } catch {
        setLastSavedText('브라우저 임시 보관에 실패했습니다. 서버에 직접 저장해 주세요.');
      }
    }, 3000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [autosaveKey, form, postId, updatedAt, enabled, dirty, recovery, checkedKey]);

  const clearAutosave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    try { localStorage.removeItem(autosaveKey); } catch { /* 서버 저장 성공에는 영향을 주지 않는다. */ }
    setRecovery(null);
    setLastSavedText(null);
  }, [autosaveKey]);

  function restore(onRestore: (saved: PostFormData) => void) {
    if (!recovery) return;
    onRestore(recovery.form);
    setRecovery(null);
    setRestored(true);
  }

  return {
    recovery, restore, clearAutosave, lastSavedText, restoredFromAutosave,
    isOlder: Boolean(recovery && postId && (recovery.version !== 2 || recovery.updatedAt !== updatedAt)),
  };
}
