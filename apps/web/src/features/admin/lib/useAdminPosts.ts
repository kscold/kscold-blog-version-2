'use client';

import { useState } from 'react';
import { useAdminPosts as useAdminPostsQuery, useDeletePost } from '@/entities/post/api/usePosts';
import { useAlert } from '@/shared/model/alertStore';

export function useAdminPosts() {
  const alert = useAlert();
  const [page, setPage] = useState(0);
  const { data: postsData, isLoading } = useAdminPostsQuery(page, 20);
  const deletePost = useDeletePost();

  const posts = postsData?.content || [];
  const totalPages = postsData?.totalPages || 0;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) return;
    try {
      await deletePost.mutateAsync(id);
      alert.success('포스트가 삭제되었습니다.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '알 수 없는 오류';
      alert.error(msg);
    }
  };

  return { posts, totalPages, page, setPage, isLoading, handleDelete };
}
