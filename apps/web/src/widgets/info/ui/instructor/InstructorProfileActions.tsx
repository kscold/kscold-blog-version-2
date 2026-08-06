'use client';

import { useState } from 'react';

export function InstructorProfileActions() {
  const [isCopied, setIsCopied] = useState(false);

  const copyPageUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={copyPageUrl}
        className="rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-bold text-surface-700 transition-colors hover:border-surface-400"
      >
        {isCopied ? '링크를 복사했습니다' : '프로필 링크 복사'}
      </button>
    </div>
  );
}
