'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import {
  usePasswordReset,
  usePasswordResetTokenStatus,
} from '@/features/auth/api/useAuthRecovery';
import { AuthSupportShell } from '@/features/auth/ui/recovery/AuthSupportShell';

function formatExpiry(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function PasswordResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { data, isLoading } = usePasswordResetTokenStatus(token);
  const passwordReset = usePasswordReset();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const expiryLabel = useMemo(() => formatExpiry(data?.expiresAt ?? null), [data?.expiresAt]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('재설정 링크를 다시 확인해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await passwordReset.mutateAsync({ token, newPassword });
      setSuccessMessage('새 비밀번호로 다시 로그인할 수 있습니다.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : '비밀번호를 다시 설정하지 못했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
  };

  return (
    <AuthSupportShell
      eyebrow="PASSWORD RESET"
      title="새 비밀번호를 설정해 주세요"
      description="메일에서 넘어온 안전한 링크를 확인한 뒤, 이 자리에서 바로 새 비밀번호를 저장할 수 있습니다."
    >
      {isLoading ? (
        <div className="rounded-[16px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
          재설정 링크를 확인하고 있습니다...
        </div>
      ) : null}

      {!isLoading && (!token || !data?.valid) ? (
        <div className="space-y-4">
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-5 text-sm leading-6 text-red-500">
            {data?.message ?? '만료되었거나 유효하지 않은 링크입니다. 새 재설정 링크를 다시 요청해주세요.'}
          </div>
          <Link href="/login/recovery?tab=password" className="inline-flex text-sm font-medium text-surface-500 transition hover:text-surface-900">
            재설정 링크 다시 요청하기
          </Link>
        </div>
      ) : null}

      {!isLoading && token && data?.valid ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-[16px] border border-surface-200 bg-surface-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">
              SECURITY WINDOW
            </p>
            <p className="mt-2 text-sm leading-6 text-surface-500">
              {expiryLabel
                ? `${expiryLabel}까지 이 링크를 사용할 수 있습니다. 저장이 끝나면 이전 비밀번호는 더 이상 쓸 수 없습니다.`
                : '이 링크는 일정 시간 동안만 사용할 수 있습니다.'}
            </p>
          </div>

          <Input
            type="password"
            data-cy="reset-password-input"
            label="새 비밀번호"
            placeholder="8자 이상, 기억하기 쉬운 새 비밀번호"
            value={newPassword}
            onChange={event => setNewPassword(event.target.value)}
            required
            minLength={8}
          />

          <Input
            type="password"
            data-cy="reset-password-confirm-input"
            label="새 비밀번호 확인"
            placeholder="같은 비밀번호를 한 번 더 입력해 주세요"
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            required
            minLength={8}
          />

          {error ? (
            <p data-cy="reset-password-error" className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p
              data-cy="reset-password-success"
              className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
            >
              {successMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={passwordReset.isPending}
            className="w-full"
            data-cy="reset-password-submit"
          >
            새 비밀번호 저장하기
          </Button>
        </form>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-surface-500">
        <Link href="/login" className="font-medium transition hover:text-surface-900">
          로그인으로 돌아가기
        </Link>
        <Link href="/" className="font-medium transition hover:text-surface-900">
          홈으로 이동
        </Link>
      </div>
    </AuthSupportShell>
  );
}
