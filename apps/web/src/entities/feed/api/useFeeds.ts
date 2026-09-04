import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { Feed, LinkPreview } from '@/shared/model/types/social';
import { PageResponse } from '@/shared/model/types/api';

interface UseFeedsOptions {
  page?: number;
  size?: number;
  tag?: string;
  initialData?: PageResponse<Feed>;
}

export function useFeeds(options: UseFeedsOptions = {}) {
  const { page = 0, size = 12, tag, initialData } = options;
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (tag) params.set('tag', tag);

  return useQuery({
    queryKey: ['feeds', { page, size, tag }],
    queryFn: () => apiClient.get<PageResponse<Feed>>(`/feeds?${params.toString()}`),
    initialData,
  });
}

export function useFeed(id: string, initialData?: Feed) {
  return useQuery({
    queryKey: ['feeds', id],
    queryFn: () => apiClient.get<Feed>(`/feeds/${id}`),
    enabled: !!id,
    initialData,
  });
}

export function useAdminFeeds(page: number = 0, size: number = 12) {
  return useQuery({
    queryKey: ['feeds', 'admin', { page, size }],
    queryFn: () => apiClient.get<PageResponse<Feed>>(`/feeds/admin?page=${page}&size=${size}`),
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
