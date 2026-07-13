'use client';

import { PostEditor } from '@/features/editor';
import { usePostCreate } from '@/features/editor';

export function PostCreateEditor() {
  const { handleSubmit, isSubmitting } = usePostCreate();

  return (
    <PostEditor
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      autosaveKey="autosave-new-post"
    />
  );
}
