import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { VaultNoteComment, VaultNoteCommentCreateRequest } from '@/shared/model/types/vault';

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
    mutationFn: (commentId: string) =>
      apiClient.delete<void>(`/vault/notes/${noteId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-comments', noteId] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}
