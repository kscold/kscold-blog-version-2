'use client';

import Link from 'next/link';

export function LoginHomeLink() {
  return (
    <div className="mt-6 text-center">
      <Link
        href="/"
        className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors inline-flex items-center gap-2 group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        홈으로 돌아가기
      </Link>
    </div>
  );
}
