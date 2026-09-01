'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/entities/user';
import { subscribeAuthSessionBridge } from '@/shared/model/authSessionBridge';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const ReactQueryDevtools = process.env.NODE_ENV === 'development'
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
    void Promise.resolve(useAuthStore.persist.rehydrate())
      .finally(() => useAuthStore.getState().setHasHydrated(true));

    const unsubscribe = subscribeAuthSessionBridge({
      onTokenChange: token => {
        if (token) {
          useAuthStore.getState().setToken(token);
        }
      },
      onSessionCleared: () => {
        useAuthStore.getState().clearAuth();
        queryClient.clear();
      },
    });

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
