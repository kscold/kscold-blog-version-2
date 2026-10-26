'use client';

import { useEffect, useRef } from 'react';
import { getPostPath, getPostPublication, PUBLICATION } from '@/entities/post';
import { SITE_URL } from '@/shared/lib/seo/constants';
import type { Post } from '@/shared/model/types/blog';
import type { PublicationConfirmation } from '../model/usePostSubmission';

interface Props {
  value: PublicationConfirmation;
  previous?: Post;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PostPublishConfirmation({ value, previous, busy, onConfirm, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const target = dialog.current;
    const trigger = document.getElementById('post-submit-button');
    target?.showModal();
    return () => { target?.close(); trigger?.focus(); };
  }, []);
  const path = getPostPath({ slug: value.form.slug, category: value.category });
  const oldPath = previous ? getPostPath(previous) : null;
  const republishing = previous?.publishedAt && previous.status !== 'PUBLISHED' && value.form.status === 'PUBLISHED';
  const stopping = previous?.status === 'PUBLISHED' && value.form.status !== 'PUBLISHED';

  return (
    <dialog ref={dialog} aria-labelledby="publish-confirm-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-3xl border border-surface-200 bg-white p-5 text-surface-900 shadow-xl backdrop:bg-surface-900/40 sm:p-7">
      <h2 id="publish-confirm-title" className="text-xl font-bold">{stopping ? '발행을 중단할까요?' : '저장할 내용을 확인해 주세요'}</h2>
      <p className="mt-2 break-words font-semibold">{value.form.title}</p>
      <dl className="mt-5 space-y-4 text-sm">
        <div><dt className="text-surface-500">상태 변경</dt><dd className="mt-1 font-bold">
          {previous ? PUBLICATION[getPostPublication(previous)].label : '새 글'} → {PUBLICATION[value.state].label}
        </dd></div>
        <div><dt className="text-surface-500">열람 대상</dt><dd className="mt-1 leading-6">{PUBLICATION[value.state].description}</dd></div>
        <div><dt className="text-surface-500">카테고리</dt><dd className="mt-1">{value.category.name}</dd></div>
        {oldPath && oldPath !== path && <div><dt className="text-surface-500">이전 주소</dt><dd className="mt-1 [overflow-wrap:anywhere]">{SITE_URL + oldPath}</dd></div>}
        <div><dt className="text-surface-500">저장 후 글 주소</dt><dd className="mt-1 [overflow-wrap:anywhere]">{SITE_URL + path}</dd></div>
      </dl>
      {value.changeSlug && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">기존 주소에서 자동으로 이동하는 기능은 없습니다. 공유한 링크가 열리지 않을 수 있습니다.</p>}
      {republishing && <p className="mt-3 text-sm text-surface-600">재발행하면 발행일이 갱신됩니다.</p>}
      {stopping && <p className="mt-3 text-sm text-surface-600">기존 발행본도 방문자에게 보이지 않게 됩니다. 발행본과 별도로 수정 초안을 저장하는 기능은 아닙니다.</p>}
      {value.state === 'restricted' && <div className="mt-4 rounded-xl bg-surface-50 p-4 text-sm">
        <p className="font-semibold">방문자에게 공개되는 요약</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-surface-600">{value.form.excerpt || (previous ? '요약 없음' : '요약을 비워 두어 본문 앞부분에서 자동 생성됩니다. 민감한 내용은 요약을 직접 입력해 주세요.')}</p>
      </div>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" disabled={busy} onClick={onCancel} className="rounded-full border border-surface-200 px-5 py-3 text-sm font-semibold disabled:opacity-50">돌아가서 편집</button>
        <button type="button" disabled={busy} onClick={onConfirm} data-testid="post-confirm-save"
          className="rounded-full bg-surface-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? '저장 중…' : stopping ? '발행 중단하고 저장' : '확인하고 저장'}
        </button>
      </div>
    </dialog>
  );
}
