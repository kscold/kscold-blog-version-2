'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostEditorPublishPanel } from '@/features/editor/ui/post-editor-sidebar/PostEditorPublishPanel';
import { PostEditorSeoPanel } from '@/features/editor/ui/post-editor-sidebar/PostEditorSeoPanel';
import { PostEditorSubmitPanel } from '@/features/editor/ui/post-editor-sidebar/PostEditorSubmitPanel';
import type { PostEditorSidebarProps } from '@/features/editor/ui/post-editor-sidebar/postEditorSidebar.types';

export function PostEditorSidebar({
  mode,
  form,
  categories,
  isSubmitting,
  lastSavedText,
  onUpdateForm,
}: PostEditorSidebarProps) {
  const router = useRouter();
  const [showSeo, setShowSeo] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <aside data-cy="post-editor-sidebar" className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <PostEditorPublishPanel
        categories={categories}
        form={form}
        isHydrated={isHydrated}
        mode={mode}
        onUpdateForm={onUpdateForm}
      />
      <PostEditorSeoPanel
        form={form}
        isOpen={showSeo}
        onToggle={() => setShowSeo(prev => !prev)}
        onUpdateForm={onUpdateForm}
      />
      <PostEditorSubmitPanel
        isSubmitting={isSubmitting}
        lastSavedText={lastSavedText}
        mode={mode}
        onBack={() => router.push('/admin/posts')}
      />
    </aside>
  );
}
