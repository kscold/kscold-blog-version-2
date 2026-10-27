'use client';

import { useRef, useState } from 'react';
import { getPostPath } from '@/entities/post';
import { SITE_URL } from '@/shared/lib/seo/constants';

interface Props {
  slug: string;
  category?: { slug: string };
  originalSlug?: string;
  unlocked: boolean;
  error: string | null;
  checking: boolean;
  onChange: (value: string) => void;
  onUnlock: () => void;
  onCancel: () => void;
}

export function PostEditorAddressPanel(props: Props) {
  const { slug, category, originalSlug, unlocked, error, checking, onChange, onUnlock, onCancel } = props;
  const input = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const path = category && slug ? getPostPath({ slug, category }) : null;
  const locked = originalSlug !== undefined && !unlocked;

  async function copy() {
    if (!path) return;
    try { await navigator.clipboard.writeText(SITE_URL + path); setCopyStatus('주소를 복사했습니다.'); }
    catch { setCopyStatus('주소를 선택해 직접 복사해 주세요.'); }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-surface-200 bg-surface-50 p-4" aria-label="글 주소">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="post-slug" className="text-sm font-bold text-surface-900">글 주소</label>
        {originalSlug !== undefined && (
          <button type="button" onClick={() => {
            if (locked) { onUnlock(); requestAnimationFrame(() => input.current?.focus()); } else onCancel();
          }} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-700">
            {locked ? '주소 변경' : '주소 변경 취소'}
          </button>
        )}
      </div>
      <input ref={input} id="post-slug" data-testid="post-editor-slug" value={slug} readOnly={locked}
        onChange={event => onChange(event.target.value)} placeholder="my-post-address" autoCapitalize="none" spellCheck={false}
        aria-describedby="post-slug-help post-slug-error" aria-invalid={Boolean(error)}
        className="w-full min-w-0 rounded-xl border border-surface-200 bg-white px-3 py-3 font-mono text-sm text-surface-900 read-only:bg-surface-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500" />
      <p id="post-slug-help" className="text-xs leading-5 text-surface-600">
        {originalSlug !== undefined ? '제목을 바꾸어도 기존 주소는 유지됩니다. 주소를 변경하면 이전 링크가 열리지 않을 수 있습니다.'
          : '영문 제목에서만 주소를 제안합니다. 한글·혼합 제목은 영문 소문자·숫자·하이픈으로 주소를 입력해 주세요.'}
      </p>
      <p id="post-slug-error" role={error ? 'alert' : undefined} className="text-xs leading-5 text-red-700">
        {error || (checking ? '주소 중복 확인 중…' : '')}
      </p>
      <div className="border-t border-surface-200 pt-3">
        <p className="text-xs font-semibold text-surface-500">저장 후 글 주소</p>
        <p data-testid="post-editor-url" className="mt-1 select-all text-sm text-surface-700 wrap-anywhere">
          {path ? SITE_URL + path : '카테고리와 글 주소를 정하면 최종 주소가 표시됩니다.'}
        </p>
        {path && !error && <button type="button" onClick={copy} className="mt-2 rounded-lg px-2 py-2 text-xs font-semibold text-primary-700">주소 복사</button>}
        <p role="status" className="text-xs text-surface-600">{copyStatus}</p>
      </div>
    </section>
  );
}
