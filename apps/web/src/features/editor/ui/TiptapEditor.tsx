'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import {
  buildEditorExtensions,
  buildEditorProps,
  preprocessEditorMarkdown,
  promptCodeBlockLanguage,
  promptImageUpload,
  promptImageRowUpload,
  promptLinkUrl,
  promptVideoUpload,
  readMarkdown,
} from '@/features/editor/lib/tiptapEditor';
import {
  buildBlockToolbarButtons,
  buildMobileToolbarButtonsForEditor,
  buildPrimaryToolbarButtons,
} from '@/features/editor/model/tiptapToolbar';
import { EditorSurfaceHeader } from '@/features/editor/ui/EditorSurfaceHeader';
import { EditorBubbleMenu } from '@/features/editor/ui/EditorBubbleMenu';
import { EditorContentArea } from '@/features/editor/ui/EditorContentArea';

interface TiptapEditorProps {
  defaultContent?: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function TiptapEditor({
  defaultContent = '',
  onChange,
  placeholder = "문서를 작성하세요... '/'를 입력하면 블록 메뉴가 열립니다.",
  minHeight = '560px',
}: TiptapEditorProps) {
  const { uploadFile, uploadVideo, isUploading } = useMediaUpload();
  const editorRef = useRef<Editor | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        return await uploadFile(file);
      } catch {
        return null;
      }
    },
    [uploadFile]
  );

  const uploadVideoFile = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        return await uploadVideo(file);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : '동영상 업로드에 실패했습니다');
        return null;
      }
    },
    [uploadVideo]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildEditorExtensions(placeholder, {
      insertImage: ed => void promptImageUpload(ed, uploadImage),
      insertImageRow: ed => void promptImageRowUpload(ed, uploadImage),
      insertVideo: ed => void promptVideoUpload(ed, uploadVideoFile),
    }),
    content: preprocessEditorMarkdown(defaultContent),
    onUpdate({ editor }) {
      editorRef.current = editor;
      onChange(readMarkdown(editor));
    },
    onCreate({ editor }) {
      editorRef.current = editor;
    },
    onDestroy() {
      editorRef.current = null;
    },
    editorProps: buildEditorProps(minHeight, () => editorRef.current, uploadImage),
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return null;

  const actions = {
    addLink: () => promptLinkUrl(editor),
    addVideo: () => void promptVideoUpload(editor, uploadVideoFile),
    addImage: () => void promptImageUpload(editor, uploadImage),
    addImageRow: () => void promptImageRowUpload(editor, uploadImage),
    setCodeBlockLanguage: () => promptCodeBlockLanguage(editor),
    setText: () => editor.chain().focus().setParagraph().run(),
    setBulletList: () => editor.chain().focus().toggleBulletList().run(),
    setOrderedList: () => editor.chain().focus().toggleOrderedList().run(),
    setBlockquote: () => editor.chain().focus().toggleBlockquote().run(),
  };

  const primaryButtons = buildPrimaryToolbarButtons(editor, actions);
  const blockButtons = buildBlockToolbarButtons(editor, actions);
  const mobileButtons = buildMobileToolbarButtonsForEditor(editor, actions);

  return (
    <div
      data-cy="post-editor-document"
      className="overflow-hidden rounded-[28px] border border-surface-200 bg-white shadow-sm"
    >
      <EditorSurfaceHeader
        isUploading={isUploading}
        primaryButtons={primaryButtons}
        blockButtons={blockButtons}
      />

      <EditorBubbleMenu editor={editor} />

      <EditorContentArea editor={editor} mobileButtons={mobileButtons} />
    </div>
  );
}
