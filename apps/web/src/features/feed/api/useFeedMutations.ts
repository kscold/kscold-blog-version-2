import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { Feed, FeedCreateRequest, FeedUpdateRequest } from '@/shared/model/types/social';
import { revalidateFeed } from './revalidateFeed';

export function useCreateFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeedCreateRequest) => apiClient.post<Feed>('/feeds', data),
    onSuccess: created => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      void revalidateFeed(created?.id);
    },
  });
}

export function useUpdateFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedUpdateRequest }) =>
      apiClient.put<Feed>(`/feeds/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['feeds', variables.id] });
      // 서버에 캐시된 상세 HTML 도 비워야 새로고침했을 때 고친 내용이 보인다.
      void revalidateFeed(variables.id);
    },
  });
}

export function useDeleteFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/feeds/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      void revalidateFeed(id);
    },
  });
}
