'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/api/useAuth';
import { useAuthStore } from '@/entities/user';
import { AUTH_INPUT_LIMITS } from './authInputLimits';
import { resolveSafeRedirect } from '../lib/resolveSafeRedirect';

interface LoginFormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

const DEFAULT_FORM_DATA: LoginFormData = {
  email: '',
  password: '',
  username: '',
  displayName: '',
};

function validateRegistrationForm(formData: LoginFormData) {
  const email = formData.email.trim();
  const username = formData.username.trim();
  const displayName = formData.displayName.trim();
  const password = formData.password;

  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (email.length > AUTH_INPUT_LIMITS.email) {
    return `이메일은 ${AUTH_INPUT_LIMITS.email}자 이내로 입력해주세요.`;
  }

  if (!displayName) {
    return '이름을 입력해주세요.';
  }

  if (displayName.length > 30) {
    return '이름은 30자 이내로 입력해주세요.';
  }

  if (!username) {
    return '아이디를 입력해주세요.';
  }

  if (username.length < 3 || username.length > 20) {
    return '아이디는 3-20자여야 합니다.';
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return '아이디는 영문 소문자, 숫자, 밑줄(_)만 사용할 수 있어요.';
  }

  if (!password) {
    return '비밀번호를 입력해주세요.';
  }

  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }

  if (password.length > AUTH_INPUT_LIMITS.password) {
    return `비밀번호는 ${AUTH_INPUT_LIMITS.password}자 이내로 입력해주세요.`;
  }

  return null;
}

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsync, registerAsync, isLoggingIn, isRegistering, currentUser } = useAuth();
  const { setUser } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<LoginFormData>(DEFAULT_FORM_DATA);
  const [error, setError] = useState('');

  const isLoading = isLoggingIn || isRegistering;
  const redirect = useMemo(() => searchParams.get('redirect') || '/admin', [searchParams]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    router.replace(resolveSafeRedirect(redirect, currentUser.role));
  }, [currentUser, redirect, router]);

  const updateField = <K extends keyof LoginFormData>(key: K, value: LoginFormData[K]) => {
    if (error) {
      setError('');
    }
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const result = await loginAsync({
          email: formData.email.trim(),
          password: formData.password,
        });

        router.push(resolveSafeRedirect(redirect, result.user.role));
        return;
      }

      const validationError = validateRegistrationForm(formData);
      if (validationError) {
        setError(validationError);
        return;
      }

      const result = await registerAsync({
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim(),
        displayName: formData.displayName.trim(),
      });

      router.push(resolveSafeRedirect(redirect, result.user.role));
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(message);
    }
  };

  return {
    error,
    formData,
    handleSubmit,
    isLoading,
    isLogin,
    setIsLogin,
    updateField,
  };
}
