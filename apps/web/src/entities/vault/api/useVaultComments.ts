import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { VaultNoteComment, VaultNoteCommentCreateRequest } from '@/types/vault';
import { PageResponse } from '@/types/api';

export function useVaultComments(noteId: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['vault-comments', noteId, { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<VaultNoteComment>>(
        `/vault/notes/${noteId}/comments?page=${page}&size=${size}`
      ),
    enabled: !!noteId,
  });
}

export function useCreateVaultComment(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VaultNoteCommentCreateRequest) =>
      apiClient.post<VaultNoteComment>(`/vault/notes/${noteId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-comments', noteId] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useDeleteVaultComment(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => apiClient.delete<void>(`/vault/notes/${noteId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-comments', noteId] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}
