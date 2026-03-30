'use client';

import { useState } from 'react';
import { useAuthStore } from '@/entities/user/model/authStore';
import apiClient from '@/shared/api/api-client';
import Link from 'next/link';

interface RestrictedOverlayProps {
  categoryId?: string;
  categoryName?: string;
  excerpt?: string;
}

export function RestrictedOverlay({ categoryId, categoryName, excerpt }: RestrictedOverlayProps) {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRequest = async () => {
    if (!categoryId) return;
    setStatus('loading');
    try {
      await apiClient.post('/access-requests', { categoryId, message: message || null });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="relative mb-12">
      {/* 블러된 미리보기 */}
      {excerpt && (
        <div className="select-none pointer-events-none" aria-hidden>
          <div className="prose prose-lg max-w-none text-surface-700 blur-sm opacity-50">
            <p>{excerpt}</p>
            <p className="text-surface-400">
              이 글의 나머지 내용은 열람 권한이 필요합니다. 아래에서 접근을 요청할 수 있습니다.
              이 글의 나머지 내용은 열람 권한이 필요합니다. 아래에서 접근을 요청할 수 있습니다.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-50/80 to-surface-50" />
        </div>
      )}

      {/* 접근 요청 카드 */}
      <div className="relative mt-8 rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
          <svg className="h-7 w-7 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-surface-900">열람 권한이 필요한 글입니다</h3>
        <p className="mt-2 text-sm text-surface-500">
          {categoryName ? `"${categoryName}" 카테고리의 글은` : '이 글은'} 승인된 사용자만 읽을 수 있습니다.
        </p>

        {!user ? (
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-surface-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-surface-800"
            >
              로그인 후 접근 요청
            </Link>
          </div>
        ) : status === 'sent' ? (
          <div className="mt-6 rounded-xl bg-green-50 px-6 py-4 text-sm font-medium text-green-700">
            접근 요청이 등록되었습니다. 관리자 승인 후 열람할 수 있습니다.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="요청 사유를 간단히 적어주세요 (선택)"
              rows={2}
              className="w-full max-w-md mx-auto block rounded-xl border border-surface-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-surface-300 resize-none"
            />
            <button
              onClick={handleRequest}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-surface-800 disabled:opacity-50"
            >
              {status === 'loading' ? '요청 중...' : '열람 요청하기'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-500">요청 처리 중 오류가 발생했습니다. 이미 요청했을 수 있습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
