'use client';

import Link from 'next/link';

export function LoginRecoveryLinks() {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <Link
        href="/login/recovery?tab=username"
        data-cy="login-find-username"
        className="font-medium text-surface-500 transition hover:text-surface-900"
      >
        아이디 찾기
      </Link>
      <Link
        href="/login/recovery?tab=password"
        data-cy="login-reset-password"
        className="font-medium text-surface-500 transition hover:text-surface-900"
      >
        비밀번호 재설정
      </Link>
    </div>
  );
}
