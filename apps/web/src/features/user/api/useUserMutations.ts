import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';

export function useSoftDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<void>(`/admin/users/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] }),
  });
}

export function useHardDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<void>(`/admin/users/${userId}/permanent`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] }),
  });
}
