import { apiClient } from '@/shared/api/api-client';

export function useLogout() {
  return () => {
    apiClient.removeToken();

    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  };
}
