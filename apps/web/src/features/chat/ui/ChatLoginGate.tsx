'use client';

import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export function ChatLoginGate({ onClose }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-50 p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
        <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-surface-900">로그인이 필요합니다</p>
        <p className="mt-1 text-xs text-surface-400">채팅을 이용하려면 먼저 로그인해 주세요.</p>
      </div>
      <Link
        href="/login"
        onClick={onClose}
        className="rounded-xl bg-surface-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-800"
      >
        로그인하러 가기
      </Link>
    </div>
  );
}
