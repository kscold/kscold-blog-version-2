'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostEditorPublishPanel } from './post-editor-sidebar/PostEditorPublishPanel';
import { PostEditorSeoPanel } from './post-editor-sidebar/PostEditorSeoPanel';
import { PostEditorSubmitPanel } from './post-editor-sidebar/PostEditorSubmitPanel';
import type { PostEditorSidebarProps } from './post-editor-sidebar/postEditorSidebar.types';

export function PostEditorSidebar(props: PostEditorSidebarProps) {
  const router = useRouter();
  const [showSeo, setShowSeo] = useState(false);
  return (
    <aside data-testid="post-editor-sidebar" className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
      <PostEditorPublishPanel {...props} />
      <PostEditorSeoPanel form={props.form} isOpen={showSeo} onToggle={() => setShowSeo(value => !value)} onUpdateForm={props.onUpdateForm} />
      <PostEditorSubmitPanel isSubmitting={props.isSubmitting} lastSavedText={props.lastSavedText}
        submitLabel={props.submitLabel} onBack={() => router.push('/admin/posts')} />
    </aside>
  );
}
