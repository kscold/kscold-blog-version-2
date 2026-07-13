'use client';

import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import type { ToolbarButtonConfig } from '@/features/editor/model/tiptapToolbar';
import { TiptapToolbar } from '@/features/editor/ui/TiptapToolbar';

interface EditorContentAreaProps {
  editor: Editor;
  mobileButtons: ToolbarButtonConfig[];
}

export function EditorContentArea({ editor, mobileButtons }: EditorContentAreaProps) {
  return (
    <>
      <EditorContent editor={editor} />

      <div className="border-t border-surface-200 bg-surface-50 px-3 py-3 sm:hidden">
        <TiptapToolbar buttons={mobileButtons} dataCy="post-editor-mobile-actions" />
      </div>
    </>
  );
}
