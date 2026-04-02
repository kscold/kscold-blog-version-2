'use client';

import { useAuthStore } from '@/entities/user/model/authStore';
import { useInitialViewer } from '@/shared/model/ViewerProvider';

export function useViewer() {
  const { user } = useAuthStore();
  const initialViewer = useInitialViewer();

  return {
    user,
    isAuthenticated: !!user || initialViewer.isAuthenticated,
    role: user?.role ?? initialViewer.role,
  };
}
