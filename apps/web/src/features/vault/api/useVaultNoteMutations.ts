import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { VaultNote, VaultNoteCreateRequest, VaultNoteUpdateRequest } from '@/types/vault';

export function useCreateVaultNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VaultNoteCreateRequest) => apiClient.post<VaultNote>('/vault/notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useUpdateVaultNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VaultNoteUpdateRequest }) =>
      apiClient.put<VaultNote>(`/vault/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useDeleteVaultNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/vault/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}
