import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { useAuthStore } from '@/entities/user/model/authStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return () => {
    apiClient.removeToken();
    clearAuth();
    queryClient.clear();
  };
}
