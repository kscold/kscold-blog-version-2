'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/api/useAuth';
import { useAuthStore } from '@/entities/user/model/authStore';
import { apiClient } from '@/shared/api/api-client';
import type { User } from '@/types/user';

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

function resolveSafeRedirect(requestedPath: string, role: User['role']) {
  const fallback = role === 'ADMIN' ? '/admin' : '/';
  if (!requestedPath.startsWith('/') || requestedPath.startsWith('//')) {
    return fallback;
  }
  if (requestedPath.startsWith('/admin') && role !== 'ADMIN') {
    return '/';
  }
  return requestedPath;
}

function validateRegistrationForm(formData: LoginFormData) {
  const email = formData.email.trim();
  const username = formData.username.trim();
  const displayName = formData.displayName.trim();
  const password = formData.password;

  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (!username) {
    return '사용자명을 입력해주세요.';
  }

  if (username.length < 3 || username.length > 20) {
    return '사용자명은 3-20자여야 합니다.';
  }

  if (displayName && displayName.length > 30) {
    return '표시 이름은 30자 이내로 입력해주세요.';
  }

  if (!password) {
    return '비밀번호를 입력해주세요.';
  }

  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }

  return null;
}

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsync, registerAsync, isLoggingIn, isRegistering, currentUser, isLoading: isAuthLoading } = useAuth();
  const { setUser, setToken } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>(DEFAULT_FORM_DATA);
  const [error, setError] = useState('');

  const isLoading = isLoggingIn || isRegistering || isRestoringSession;
  const redirect = useMemo(() => searchParams.get('redirect') || '/admin', [searchParams]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    router.replace(resolveSafeRedirect(redirect, currentUser.role));
  }, [currentUser, redirect, router]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (apiClient.getToken() || !apiClient.hasRefreshToken()) {
        return;
      }

      setIsRestoringSession(true);

      try {
        const accessToken = await apiClient.restoreSession();
        if (!accessToken || cancelled) {
          return;
        }

        const user = await apiClient.get<User>('/auth/me');
        if (cancelled) {
          return;
        }

        setToken(accessToken);
        setUser(user);
        router.replace(resolveSafeRedirect(redirect, user.role));
      } catch {
        // 의도적으로 무시
      } finally {
        if (!cancelled) {
          setIsRestoringSession(false);
        }
      }
    };

    if (!isAuthLoading) {
      void restoreSession();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, redirect, router, setToken, setUser]);

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
        displayName: formData.displayName.trim() || formData.username.trim(),
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
