import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { MentionableUser } from '@/shared/model/types/social';

/** 특정 피드에서 @언급 가능한 사용자 목록(주인 + 댓글 참여자). */
export function useMentionableUsers(feedId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['feed-mentionable-users', feedId],
    queryFn: () => apiClient.get<MentionableUser[]>(`/feeds/${feedId}/comments/mentionable`),
    enabled: enabled && !!feedId,
    staleTime: 60 * 1000,
  });
}
