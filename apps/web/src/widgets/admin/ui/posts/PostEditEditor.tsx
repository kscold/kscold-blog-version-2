'use client';

import { PostEditor } from '@/features/editor';
import { usePostEdit } from '@/features/editor';
import { AdminEditorSkeleton } from '@/shared/ui/RouteSkeletons';

interface PostEditEditorProps {
  postId: string;
}

export function PostEditEditor({ postId }: PostEditEditorProps) {
  const { post, isLoading, error, handleSubmit, isSubmitting } = usePostEdit(postId);

  if (isLoading) {
    return <AdminEditorSkeleton />;
  }

  if (error || !post) return <p role="alert" className="p-6 text-red-700">글을 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.</p>;

  return (
    <PostEditor
      mode="edit"
      key={postId}
      post={post}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      autosaveKey={`autosave-post-${postId}`}
    />
  );
}
