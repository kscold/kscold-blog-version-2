'use client';

import { useState } from 'react';

export function CopyAgentAnswer({ content }: { content: string }) {
  const [result, setResult] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setResult('답변을 복사했어요.');
    } catch {
      setResult('복사 권한이 없어요. 답변을 선택해 복사해 주세요.');
    }
  };
  return (
    <div className="mt-3 flex items-center gap-2 border-t border-surface-100 pt-1">
      <button type="button" onClick={() => void copy()} className="min-h-9 shrink-0 text-xs font-medium text-surface-500 hover:text-primary-700">답변 복사</button>
      <span aria-live="polite" className="text-[11px] leading-4 text-surface-500">{result}</span>
    </div>
  );
}
