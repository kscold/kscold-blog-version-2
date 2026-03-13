'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PostFormData } from '@/features/editor/model/types';

interface UsePostAutosaveOptions {
  autosaveKey: string;
  mode: 'create' | 'edit';
  form: PostFormData;
}

interface AutosaveResult {
  lastSaved: Date | null;
  lastSavedText: string | null;
  restoredFromAutosave: boolean;
  tryRestoreAutosave: (
    onRestore: (form: PostFormData) => void,
  ) => void;
  clearAutosave: () => void;
}

export function usePostAutosave({
  autosaveKey,
  mode,
  form,
}: UsePostAutosaveOptions): AutosaveResult {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [restoredFromAutosave, setRestoredFromAutosave] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 자동 임시저장
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          autosaveKey,
          JSON.stringify({ form, savedAt: new Date().toISOString() }),
        );
        setLastSaved(new Date());
      } catch {
        // localStorage 접근 실패 시 무시
      }
    }, 3000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, autosaveKey]);

  // 임시저장 복구 (create 모드에서만, 마운트 시 1회 호출)
  const tryRestoreAutosave = useCallback(
    (onRestore: (savedForm: PostFormData) => void) => {
      if (mode !== 'create') return;
      try {
        const saved = localStorage.getItem(autosaveKey);
        if (saved) {
          const { form: savedForm, savedAt } = JSON.parse(saved);
          if (savedForm.title || savedForm.content) {
            const date = new Date(savedAt);
            const confirmed = window.confirm(
              `${date.toLocaleString()}에 자동 저장된 내용이 있습니다. 복구하시겠습니까?`,
            );
            if (confirmed) {
              onRestore(savedForm);
              setRestoredFromAutosave(true);
            } else {
              localStorage.removeItem(autosaveKey);
            }
          }
        }
      } catch {
        // 무시
      }
    },
    [autosaveKey, mode],
  );

  const clearAutosave = useCallback(() => {
    localStorage.removeItem(autosaveKey);
  }, [autosaveKey]);

  const lastSavedText = (() => {
    if (!lastSaved) return null;
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (diff < 60) return `${diff}초 전 자동 저장됨`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전 자동 저장됨`;
    return lastSaved.toLocaleTimeString() + ' 자동 저장됨';
  })();

  return {
    lastSaved,
    lastSavedText,
    restoredFromAutosave,
    tryRestoreAutosave,
    clearAutosave,
  };
}
