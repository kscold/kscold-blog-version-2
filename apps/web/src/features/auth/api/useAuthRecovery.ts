'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type {
  EmailRecoveryRequest,
  PasswordResetTokenStatus,
  ResetPasswordRequest,
} from '@/types/auth-recovery';

export function useUsernameRecovery() {
  return useMutation({
    mutationFn: (data: EmailRecoveryRequest) =>
      apiClient.post<void>('/auth/recover-username', data),
  });
}

export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (data: EmailRecoveryRequest) =>
      apiClient.post<void>('/auth/request-password-reset', data),
  });
}

export function usePasswordResetTokenStatus(token: string | null) {
  return useQuery({
    queryKey: ['auth', 'password-reset', 'status', token],
    queryFn: () =>
      apiClient.get<PasswordResetTokenStatus>(
        `/auth/password-reset/validate?token=${encodeURIComponent(token ?? '')}`
      ),
    enabled: Boolean(token),
    retry: false,
  });
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      apiClient.post<void>('/auth/reset-password', data),
  });
}
