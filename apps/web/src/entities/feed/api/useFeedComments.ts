import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { FeedComment, FeedCommentCreateRequest } from '@/types/social';
import { PageResponse } from '@/types/api';

export function useFeedComments(feedId: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['feed-comments', feedId, { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<FeedComment>>(
        `/feeds/${feedId}/comments?page=${page}&size=${size}`
      ),
    enabled: !!feedId,
  });
}

export function useCreateFeedComment(feedId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeedCommentCreateRequest) =>
      apiClient.post<FeedComment>(`/feeds/${feedId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments', feedId] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
}

export function useDeleteFeedComment(feedId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiClient.delete<void>(`/feeds/${feedId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments', feedId] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
}
