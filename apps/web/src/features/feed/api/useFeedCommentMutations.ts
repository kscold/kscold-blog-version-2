import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { FeedComment, FeedCommentCreateRequest } from '@/shared/model/types/social';
import { PageResponse } from '@/shared/model/types/api';

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

/**
 * 댓글 좋아요 토글. 피드 좋아요처럼 비로그인도 누를 수 있고, 서버가 갱신된 댓글을 돌려준다.
 * 목록을 통째로 다시 부르면 눌린 티가 늦게 나서, 캐시에 있는 해당 댓글만 갈아끼운다.
 */
export function useToggleFeedCommentLike(feedId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.post<FeedComment>(`/feeds/${feedId}/comments/${commentId}/like`, {}),
    onSuccess: updated => {
      queryClient.setQueriesData<PageResponse<FeedComment>>(
        { queryKey: ['feed-comments', feedId] },
        current =>
          current && {
            ...current,
            content: current.content.map(comment =>
              comment.id === updated.id ? { ...comment, ...updated } : comment
            ),
          }
      );
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
