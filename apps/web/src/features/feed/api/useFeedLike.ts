'use client';

import { useRef } from 'react';
import { useIsFetching, useIsMutating, useMutation, useQueryClient, type Query } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { useSessionIdentity } from '@/shared/model/SessionIdentity';
import type { Feed } from '@/shared/model/types/social';

function isViewerFeedQuery(query: Query, viewer: string) {
  const key = query.queryKey;
  return key.at(-1) === viewer &&
    (key[0] === 'feeds' || (key[0] === 'users' && key[2] === 'feeds'));
}

/** 목록·상세·프로필에서 본문 형태는 유지하고 서버가 확정한 좋아요 필드만 바꾼다. */
export function updateFeedReaction(data: unknown, feed: Pick<Feed, 'id' | 'isLiked' | 'likesCount'>): unknown {
  if (!data || typeof data !== 'object') return data;
  if ('id' in data && data.id === feed.id) {
    return { ...data, isLiked: feed.isLiked, likesCount: feed.likesCount };
  }
  if ('content' in data && Array.isArray(data.content)) {
    return { ...data, content: data.content.map(item => updateFeedReaction(item, feed)) };
  }
  return data;
}

export function useFeedLike(feedId: string) {
  const viewer = useSessionIdentity();
  const queryClient = useQueryClient();
  const guard = useRef<string | null>(null);
  const mutationKey = ['feed-like', viewer, feedId];
  const pendingCount = useIsMutating({ mutationKey });
  const fetching = useIsFetching({ predicate: query => isViewerFeedQuery(query, viewer) });
  const mutation = useMutation({
    mutationKey,
    retry: false,
    mutationFn: (input: { liked: boolean; viewer: string }) =>
      apiClient.put<Feed>(`/feeds/${feedId}/like`, { liked: input.liked }),
    onSuccess: async (feed, input) => {
      const filters = { predicate: (query: Query) => isViewerFeedQuery(query, input.viewer) };
      await queryClient.cancelQueries(filters);
      queryClient.setQueriesData(filters, data => updateFeedReaction(data, feed));
    },
    onSettled: (_data, _error, input) => queryClient.invalidateQueries({
      predicate: query => isViewerFeedQuery(query, input.viewer),
    }),
  });

  const submit = async (liked: boolean) => {
    if (guard.current === viewer || fetching > 0 || queryClient.isMutating({ mutationKey }) > 0) return;
    guard.current = viewer;
    try { await mutation.mutateAsync({ liked, viewer }); }
    catch { /* 서버 오류 원문 대신 고정 안내와 재조회한 상태를 표시한다. */ }
    finally { if (guard.current === viewer) guard.current = null; }
  };
  return {
    submit,
    isPending: pendingCount > 0 || fetching > 0,
    hasError: mutation.isError && mutation.variables?.viewer === viewer,
  };
}
