'use client';

import { PostEditor } from '@/features/editor/ui/PostEditor';
import { usePostCreate } from '@/features/editor/lib/usePostCreate';

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
