'use client';

import { useInitialViewer } from '@/shared/model/ViewerProvider';
import { useAuthStore } from './authStore';

export function useViewer() {
  const { user } = useAuthStore();
  const initialViewer = useInitialViewer();

  return {
    user,
    isAuthenticated: !!user || initialViewer.isAuthenticated,
    role: user?.role ?? initialViewer.role,
  };
}
