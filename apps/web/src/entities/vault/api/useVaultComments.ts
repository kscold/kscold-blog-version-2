import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { VaultNoteComment } from '@/shared/model/types/vault';
import { PageResponse } from '@/shared/model/types/api';

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
