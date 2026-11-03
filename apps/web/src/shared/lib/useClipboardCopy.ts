'use client';

import { useEffect, useRef, useState } from 'react';

/** 모바일·권한 제한 환경에서도 복사 성공과 실패를 화면에 알린다. */
export function useClipboardCopy(text: string) {
  const [label, setLabel] = useState('복사');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setLabel('복사됨');
    } catch {
      setLabel('복사 실패');
    }
    timer.current = setTimeout(() => setLabel('복사'), 2000);
  };
  return { copy, label };
}
