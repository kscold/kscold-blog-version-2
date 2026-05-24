'use client';

import { PostEditor } from '@/features/editor/ui/PostEditor';
import { usePostEdit } from '@/features/editor/lib/usePostEdit';
import { AdminEditorSkeleton } from '@/shared/ui/RouteSkeletons';

interface PostEditEditorProps {
  postId: string;
}

export function PostEditEditor({ postId }: PostEditEditorProps) {
  const { initialData, isLoading, handleSubmit, isSubmitting } = usePostEdit(postId);

  if (isLoading) {
    return <AdminEditorSkeleton />;
  }

  if (!initialData) return null;

  return (
    <PostEditor
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      autosaveKey={`autosave-post-${postId}`}
    />
  );
}
