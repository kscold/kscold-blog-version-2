'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { useSessionIdentity } from '@/shared/model/SessionIdentity';
import { Feed, LinkPreview } from '@/shared/model/types/social';
import { PageResponse } from '@/shared/model/types/api';
import { getFeedLinkUrlError, normalizeFeedLinkUrl } from '../lib/feedInputPolicy';

const LINK_PREVIEW_DEBOUNCE_MS = 400;

interface UseFeedsOptions {
  page?: number;
  size?: number;
  tag?: string;
  sort?: 'latest' | 'popular';
  initialData?: PageResponse<Feed>;
}

export function useFeeds(options: UseFeedsOptions = {}) {
  const viewer = useSessionIdentity();
  const { page = 0, size = 12, tag, sort, initialData } = options;
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (tag) params.set('tag', tag);
  if (sort) params.set('sort', sort);

  return useQuery({
    queryKey: ['feeds', { page, size, tag, ...(sort ? { sort } : {}) }, viewer],
    queryFn: ({ signal }) => apiClient.get<PageResponse<Feed>>(`/feeds?${params.toString()}`, { signal }),
    initialData: viewer === 'anonymous' ? initialData : undefined,
    initialDataUpdatedAt: 0,
    // 다른 탭에서 작성한 글도 목록에 다시 진입하거나 포커스하면 갱신한다.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useFeed(id: string, initialData?: Feed) {
  const viewer = useSessionIdentity();
  return useQuery({
    queryKey: ['feeds', id, viewer],
    queryFn: ({ signal }) => apiClient.get<Feed>(`/feeds/${id}`, { signal }),
    enabled: !!id,
    initialData: viewer === 'anonymous' ? initialData : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    refetchOnWindowFocus: true,
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

function useDebouncedLinkUrl(url: string): string {
  const [debouncedUrl, setDebouncedUrl] = useState('');

  useEffect(() => {
    const normalizedUrl = normalizeFeedLinkUrl(url);
    if (getFeedLinkUrlError(normalizedUrl)) {
      setDebouncedUrl('');
      return;
    }

    const timeoutId = window.setTimeout(
      () => setDebouncedUrl(normalizedUrl),
      LINK_PREVIEW_DEBOUNCE_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, [url]);

  return debouncedUrl;
}

export function useLinkPreview(url: string) {
  const normalizedUrl = normalizeFeedLinkUrl(url);
  const debouncedUrl = useDebouncedLinkUrl(normalizedUrl);
  const requestedUrl = debouncedUrl === normalizedUrl ? debouncedUrl : '';

  return useQuery({
    queryKey: ['link-preview', requestedUrl],
    queryFn: () =>
      apiClient.get<LinkPreview>(`/link-preview?url=${encodeURIComponent(requestedUrl)}`),
    enabled: Boolean(requestedUrl),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}
