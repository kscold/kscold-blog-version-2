'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { Feed, LinkPreview } from '@/shared/model/types/social';
import { PageResponse } from '@/shared/model/types/api';
import { getFeedLinkUrlError, normalizeFeedLinkUrl } from '../lib/feedInputPolicy';

const LINK_PREVIEW_DEBOUNCE_MS = 400;

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
