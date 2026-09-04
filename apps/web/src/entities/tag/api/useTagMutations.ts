import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { Tag } from '@/shared/model/types/blog';

const invalidateTagQueries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['tags'] }),
    queryClient.invalidateQueries({ queryKey: ['tag-index'] }),
  ]);

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.post<Tag>('/tags', { name }),
    onSuccess: () => invalidateTagQueries(queryClient),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, categoryId }: { id: string; name: string; categoryId?: string }) =>
      apiClient.put<Tag>(`/tags/${id}`, { name, categoryId }),
    onSuccess: () => invalidateTagQueries(queryClient),
  });
}

export function useReindexTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<number>('/tags/reindex', {}),
    onSuccess: async () => {
      await invalidateTagQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['feed-tags'] });
    },
  });
}

export function useMergeTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      apiClient.post<number>('/tags/merge', { sourceId, targetId }),
    onSuccess: async () => {
      await invalidateTagQueries(queryClient);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['feeds'] }),
        queryClient.invalidateQueries({ queryKey: ['feed-tags'] }),
      ]);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/tags/${id}`),
    onSuccess: () => invalidateTagQueries(queryClient),
  });
}
