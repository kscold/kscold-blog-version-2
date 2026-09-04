'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error('App route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <p className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-surface-400">
          Temporary Error
        </p>
        <h1 className="mb-4 font-sans text-4xl font-black tracking-tighter text-surface-900 dark:text-surface-50 sm:text-5xl">
          잠시 문제가 발생했습니다
        </h1>
        <p className="mb-10 leading-relaxed text-surface-500 dark:text-surface-400">
          요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-xl bg-surface-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-700"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-surface-200 px-6 py-3 text-sm font-bold text-surface-700 transition-colors hover:border-surface-900 hover:text-surface-900 dark:border-surface-700 dark:text-surface-200 dark:hover:text-surface-50"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
