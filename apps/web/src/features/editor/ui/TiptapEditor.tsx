'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
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
import { TiptapToolbar } from '@/features/editor/ui/TiptapToolbar';

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
      <div className="sticky top-0 z-10 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                Editor Surface
              </p>
              <p className="mt-1 text-sm text-surface-500">
                문서 위에서 바로 서식을 바꾸고, 이미지는 붙여넣기나 드래그로 빠르게 넣을 수
                있습니다.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-500">
              <span className={`h-2 w-2 rounded-full ${isUploading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {isUploading ? '이미지 업로드 중' : '문서 편집 준비됨'}
            </div>
          </div>

          <TiptapToolbar buttons={primaryButtons} dataCy="post-editor-toolbar" />
          <TiptapToolbar buttons={blockButtons} dataCy="post-editor-quick-actions" />
        </div>
      </div>

      {/* 노션식 버블 메뉴 — 텍스트를 선택하면 떠오르는 서식 툴바 */}
      <BubbleMenu
        editor={editor}
        options={{ placement: 'top', offset: 10 }}
        shouldShow={({ editor: ed, state }) => {
          const { empty } = state.selection;
          if (empty) return false;
          if (ed.isActive('codeBlock') || ed.isActive('image') || ed.isActive('imageRow') || ed.isActive('video')) {
            return false;
          }
          return true;
        }}
      >
        <div className="flex items-center overflow-hidden rounded-xl border border-surface-200 bg-white/95 shadow-lg backdrop-blur-sm">
          {[
            {
              label: 'B',
              title: '굵게',
              active: editor.isActive('bold'),
              className: 'font-black',
              onClick: () => editor.chain().focus().toggleBold().run(),
            },
            {
              label: 'I',
              title: '기울임',
              active: editor.isActive('italic'),
              className: 'italic font-serif',
              onClick: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              label: 'S',
              title: '취소선',
              active: editor.isActive('strike'),
              className: 'line-through',
              onClick: () => editor.chain().focus().toggleStrike().run(),
            },
            {
              label: '</>',
              title: '인라인 코드',
              active: editor.isActive('code'),
              className: 'font-mono text-[11px]',
              onClick: () => editor.chain().focus().toggleCode().run(),
            },
            {
              label: '링크',
              title: '링크',
              active: editor.isActive('link'),
              className: 'text-xs font-bold',
              onClick: () => promptLinkUrl(editor),
            },
          ].map(btn => (
            <button
              key={btn.title}
              type="button"
              title={btn.title}
              onClick={btn.onClick}
              className={`flex h-9 min-w-9 items-center justify-center px-2.5 text-sm transition-colors ${btn.className} ${
                btn.active
                  ? 'bg-surface-900 text-white'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />

      <div className="border-t border-surface-200 bg-surface-50 px-3 py-3 sm:hidden">
        <TiptapToolbar buttons={mobileButtons} dataCy="post-editor-mobile-actions" />
      </div>
    </div>
  );
}
