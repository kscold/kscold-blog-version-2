'use client';

import { useRef, useState } from 'react';

type CopyState = 'idle' | 'copied' | 'manual';

async function copyText(text: string) {
  // 권한이 막혔거나(NotAllowedError) 보안 연결이 아니어서 clipboard가 없으면 실패로 돌려준다.
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyPageLinkButton() {
  const [state, setState] = useState<CopyState>('idle');
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const copyPageUrl = async () => {
    const pageUrl = window.location.href;
    setUrl(pageUrl);
    if (await copyText(pageUrl)) {
      setState('copied');
      window.setTimeout(() => setState('idle'), 1800);
      return;
    }
    // 복사할 수 없으면 주소를 직접 고를 수 있게 보여 준다.
    setState('manual');
    window.setTimeout(() => inputRef.current?.select(), 0);
  };

  return (
    <div className="flex flex-col items-start gap-2 print:hidden">
      <button
        type="button"
        onClick={copyPageUrl}
        className="min-h-11 rounded-full border border-surface-200 bg-white px-4 text-sm font-bold text-surface-700 transition-colors hover:border-surface-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900"
      >
        {state === 'copied' ? '링크를 복사했습니다' : '페이지 링크 복사'}
      </button>
      {state === 'manual' && (
        <div data-testid="copy-link-fallback" className="w-64 max-w-[70vw]">
          <label htmlFor="page-link" className="mb-1 block text-xs text-surface-500">
            이 브라우저에서는 자동 복사가 막혀 있습니다. 주소를 길게 누르거나 선택해 복사하세요.
          </label>
          <input
            ref={inputRef}
            id="page-link"
            readOnly
            value={url}
            onFocus={event => event.currentTarget.select()}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-xs text-surface-800"
          />
        </div>
      )}
    </div>
  );
}
