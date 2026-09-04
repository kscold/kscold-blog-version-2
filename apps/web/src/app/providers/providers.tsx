'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/entities/user';
import { apiClient } from '@/shared/api/api-client';
import { hasLegacyAuthTokens } from '@/shared/lib/authTokenStorage';
import { subscribeAuthSessionBridge } from '@/shared/model/authSessionBridge';
import type { User } from '@/shared/model/types/user';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_QUERY_DEVTOOLS !== 'false'
  ? dynamic(
      () => import('@tanstack/react-query-devtools').then(module => module.ReactQueryDevtools),
      { ssr: false }
    )
  : () => null;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    const unsubscribe = subscribeAuthSessionBridge({
      onSessionCleared: () => {
        useAuthStore.getState().clearAuth();
        queryClient.clear();
      },
    });

    const restoreSession = async () => {
      await Promise.resolve(useAuthStore.persist.rehydrate());
      const storedUser = useAuthStore.getState().user;

      if (!storedUser && !hasLegacyAuthTokens()) {
        return;
      }

      if (!(await apiClient.migrateLegacySession())) {
        throw new Error('기존 세션을 안전한 쿠키로 전환하지 못했습니다.');
      }

      const user = await apiClient.get<User>('/auth/me');
      useAuthStore.getState().setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
    };

    void restoreSession()
      .catch(() => {
        apiClient.clearSession();
        queryClient.clear();
      })
      .finally(() => useAuthStore.getState().setHasHydrated(true));

    return unsubscribe;
  }, [queryClient]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
