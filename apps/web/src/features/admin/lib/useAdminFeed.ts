'use client';

import { useState } from 'react';
import { useAdminFeeds, useDeleteFeed } from '@/entities/feed/api/useFeeds';
import { useAlert } from '@/shared/model/alertStore';

export function useAdminFeed() {
  const alert = useAlert();
  const [page, setPage] = useState(0);
  const { data: feedsData, isLoading } = useAdminFeeds(page, 20);
  const deleteFeed = useDeleteFeed();

  const feeds = feedsData?.content || [];
  const totalPages = feedsData?.totalPages || 0;

  const handleDelete = async (id: string) => {
    if (!confirm('이 피드를 삭제하시겠습니까?')) return;
    try {
      await deleteFeed.mutateAsync(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다';
      alert.error(message);
    }
  };

  return { feeds, totalPages, page, setPage, isLoading, handleDelete };
}
