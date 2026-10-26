'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getPostViewPath, getPostPublication, PUBLICATION } from '@/entities/post';
import { SITE_URL } from '@/shared/lib/seo/constants';
import { retryPostRefresh } from '../api/savePost';
import type { PostSaveResult as Result } from '../model/types';

export function PostSaveResult({ result, onContinue }: { result: Result; onContinue: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const [refreshed, setRefreshed] = useState(result.cacheRefreshed);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const { post } = result;
  const href = getPostViewPath(post);
  const state = getPostPublication(post);
  async function refresh() {
    setRefreshing(true);
    const done = await retryPostRefresh(post.id).catch(() => false);
    setRefreshed(done);
    setMessage(done ? '공개 화면을 갱신했습니다.' : '화면을 갱신하지 못했습니다. 저장된 글은 유지됩니다.');
    setRefreshing(false);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(SITE_URL + href); setMessage('주소를 복사했습니다.'); }
    catch { setMessage('아래 주소를 선택해 복사해 주세요.'); }
  }
  return (
    <section data-testid="post-save-result" className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8" aria-label="글 저장 결과">
      <p className="text-sm font-semibold text-primary-700">서버에 저장됨</p>
      <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold text-surface-900">{state === 'draft' ? '초안을 저장했습니다' : state === 'archived' ? '글을 보관했습니다' : '글을 발행했습니다'}</h1>
      <p className="break-words text-lg font-semibold text-surface-900">{post.title}</p>
      <p className="text-sm font-bold text-surface-700">{PUBLICATION[state].label}</p>
      <p className="text-sm leading-6 text-surface-600">{PUBLICATION[state].description}</p>
      <p className="select-all rounded-xl bg-surface-50 p-4 text-sm text-surface-700 [overflow-wrap:anywhere]">{SITE_URL + href}</p>
      {!refreshed && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <p>저장됨 · 화면 갱신 확인 필요. 글을 다시 저장하지 않고 화면 갱신만 재시도합니다.</p>
        <button type="button" disabled={refreshing} onClick={refresh} className="mt-2 rounded-lg border border-amber-200 px-3 py-2 font-semibold">{refreshing ? '갱신 중…' : '화면 갱신 재시도'}</button>
      </div>}
      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <Link href={href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-surface-900 px-5 py-3 text-white">{post.status === 'PUBLISHED' ? '글 열어보기' : '관리자 미리보기'}</Link>
        <button type="button" onClick={copy} className="rounded-full border border-surface-200 px-5 py-3">주소 복사</button>
        <button type="button" onClick={onContinue} className="rounded-full border border-surface-200 px-5 py-3">계속 편집</button>
        <Link href="/admin/posts" className="rounded-full border border-surface-200 px-5 py-3">목록으로</Link>
      </div>
      {state === 'restricted' && <p className="text-xs leading-5 text-surface-500">관리자는 승인 없이 본문을 읽을 수 있습니다. 이 링크를 관리자 계정으로 여는 것은 비로그인 공개 확인과 다릅니다.</p>}
      <p role="status" className="text-sm text-surface-600">{message}</p>
    </section>
  );
}
