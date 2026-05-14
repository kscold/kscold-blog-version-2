import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { Feed, FeedCreateRequest, FeedUpdateRequest, LinkPreview } from '@/types/social';
import { PageResponse } from '@/types/api';

interface UseFeedsOptions {
  page?: number;
  size?: number;
  tag?: string;
}

export function useFeeds(options: UseFeedsOptions = {}) {
  const { page = 0, size = 12, tag } = options;
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (tag) params.set('tag', tag);

  return useQuery({
    queryKey: ['feeds', { page, size, tag }],
    queryFn: () => apiClient.get<PageResponse<Feed>>(`/feeds?${params.toString()}`),
  });
}

export function useFeed(id: string) {
  return useQuery({
    queryKey: ['feeds', id],
    queryFn: () => apiClient.get<Feed>(`/feeds/${id}`),
    enabled: !!id,
  });
}

export function useAdminFeeds(page: number = 0, size: number = 12) {
  return useQuery({
    queryKey: ['feeds', 'admin', { page, size }],
    queryFn: () => apiClient.get<PageResponse<Feed>>(`/feeds/admin?page=${page}&size=${size}`),
  });
}

export function useCreateFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeedCreateRequest) => apiClient.post<Feed>('/feeds', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
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
    },
  });
}

export function useDeleteFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/feeds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedId: string) => apiClient.post<Feed>(`/feeds/${feedId}/like`),
    onSuccess: (_, feedId) => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['feeds', feedId] });
    },
  });
}

export interface FeedTagInfo {
  name: string;
  count: number;
}

export function useFeedTags() {
  return useQuery({
    queryKey: ['feed-tags'],
    queryFn: () => apiClient.get<FeedTagInfo[]>('/feeds/tags'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLinkPreview(url: string) {
  return useQuery({
    queryKey: ['link-preview', url],
    queryFn: () => apiClient.get<LinkPreview>(`/link-preview?url=${encodeURIComponent(url)}`),
    enabled: !!url && url.startsWith('http'),
    staleTime: 1000 * 60 * 30,
  });
}
