'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import {
  usePasswordResetRequest,
  useUsernameRecovery,
} from '@/features/auth/api/useAuthRecovery';
import { AuthSupportShell } from '@/features/auth/ui/recovery/AuthSupportShell';

type RecoveryTab = 'username' | 'password';

function resolveTab(value: string | null): RecoveryTab {
  return value === 'password' ? 'password' : 'username';
}

export function AccountRecoveryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = useMemo(() => resolveTab(searchParams.get('tab')), [searchParams]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const usernameRecovery = useUsernameRecovery();
  const passwordResetRequest = usePasswordResetRequest();
  const isLoading = usernameRecovery.isPending || passwordResetRequest.isPending;

  const switchTab = (tab: RecoveryTab) => {
    setError('');
    setSuccessMessage('');
    router.replace(`/login/recovery?tab=${tab}`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (activeTab === 'username') {
        await usernameRecovery.mutateAsync({ email });
        setSuccessMessage('가입한 이메일로 아이디 안내를 보냈습니다. 메일함을 확인해주세요.');
        return;
      }

      await passwordResetRequest.mutateAsync({ email });
      setSuccessMessage('비밀번호 재설정 링크를 이메일로 보냈습니다. 메일함을 확인해주세요.');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : '복구 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
  };

  return (
    <AuthSupportShell
      eyebrow="ACCOUNT RECOVERY"
      title={activeTab === 'username' ? '아이디를 찾아드릴게요' : '비밀번호를 다시 연결할게요'}
      description="가입한 이메일만 입력하면, 블로그에 맞는 안내 메일로 바로 이어드릴게요. 아이디 확인과 비밀번호 재설정은 같은 화면에서 편하게 전환할 수 있습니다."
    >
      <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-surface-200 bg-surface-50 p-1">
        <button
          type="button"
          data-cy="recovery-tab-username"
          onClick={() => switchTab('username')}
          className={`rounded-[10px] px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'username'
              ? 'bg-surface-900 text-white shadow-[0_6px_20px_rgba(15,23,42,0.16)]'
              : 'text-surface-500 hover:text-surface-900'
          }`}
        >
          아이디 찾기
        </button>
        <button
          type="button"
          data-cy="recovery-tab-password"
          onClick={() => switchTab('password')}
          className={`rounded-[10px] px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'password'
              ? 'bg-surface-900 text-white shadow-[0_6px_20px_rgba(15,23,42,0.16)]'
              : 'text-surface-500 hover:text-surface-900'
          }`}
        >
          비밀번호 재설정
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          type="email"
          data-cy="recovery-email-input"
          label="가입 이메일"
          placeholder="가입에 사용한 이메일을 입력해 주세요"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
        />

        <div className="rounded-[16px] border border-surface-200 bg-surface-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">
            {activeTab === 'username' ? 'USERNAME' : 'RESET LINK'}
          </p>
          <p className="mt-2 text-sm leading-6 text-surface-500">
            {activeTab === 'username'
              ? '아이디는 화면에 바로 노출하지 않고, 가입 메일함으로만 안전하게 안내합니다.'
              : '새 비밀번호를 입력할 수 있는 링크를 보내드릴게요. 링크는 일정 시간 뒤 자동으로 만료됩니다.'}
          </p>
        </div>

        {error ? (
          <p data-cy="recovery-error" className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p
            data-cy="recovery-success"
            className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
          >
            {successMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          data-cy="recovery-submit"
        >
          {activeTab === 'username' ? '아이디 안내 메일 보내기' : '재설정 링크 보내기'}
        </Button>
      </form>

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
