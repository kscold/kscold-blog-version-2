import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { FeedComment, FeedCommentCreateRequest } from '@/shared/model/types/social';

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
    mutationFn: (commentId: string) =>
      apiClient.delete<void>(`/feeds/${feedId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments', feedId] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
}
