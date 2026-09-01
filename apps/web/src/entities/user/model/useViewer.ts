'use client';

import { useInitialViewer } from '@/shared/model/ViewerProvider';
import { useAuthStore } from './authStore';

export function useViewer() {
  const { user, hasHydrated } = useAuthStore();
  const initialViewer = useInitialViewer();

  return {
    user,
    isReady: hasHydrated || initialViewer.isAuthenticated,
    isAuthenticated: !!user || initialViewer.isAuthenticated,
    role: user?.role ?? initialViewer.role,
  };
}
