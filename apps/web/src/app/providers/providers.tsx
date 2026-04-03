'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { subscribeAuthSessionBridge } from '@/shared/model/authSessionBridge';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

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
    void useAuthStore.persist.rehydrate();

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
