import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { FeedComment } from '@/types/social';
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
