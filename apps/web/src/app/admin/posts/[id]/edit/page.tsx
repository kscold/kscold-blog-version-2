'use client';

import { useParams } from 'next/navigation';
import { PostEditor } from '@/features/editor/ui/PostEditor';
import { usePostEdit } from '@/features/editor/lib/usePostEdit';

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const { initialData, isLoading, handleSubmit, isSubmitting } = usePostEdit(postId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-beige dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      </div>
    );
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
