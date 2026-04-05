'use client';

import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  defaultContent?: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
}

type ToolbarButtonProps = {
  label: string;
  title: string;
  active?: boolean;
  onClick: () => void;
  tone?: 'default' | 'accent';
};

export default function TiptapEditor({
  defaultContent = '',
  onChange,
  placeholder = '문서를 작성하세요... 이미지를 붙여넣거나 드래그해서 바로 넣을 수 있어요.',
  minHeight = '560px',
}: TiptapEditorProps) {
  const { uploadFile, isUploading } = useMediaUpload();

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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({ transformPastedText: true }),
    ],
    content: defaultContent,
    onUpdate({ editor }) {
      const storage = editor.storage as unknown as Record<string, { getMarkdown: () => string }>;
      onChange(storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-[420px] px-5 py-6 text-[15px] leading-7 text-surface-800 focus:outline-none sm:min-h-[520px] sm:px-8 sm:py-8 sm:text-base prose-headings:font-black prose-headings:tracking-tight prose-headings:text-surface-900 prose-p:text-surface-700 prose-li:text-surface-700 prose-blockquote:border-l-surface-300 prose-blockquote:text-surface-500 prose-code:text-surface-900 prose-pre:rounded-2xl prose-pre:bg-surface-950 prose-img:rounded-2xl prose-img:shadow-sm',
        style: `min-height: ${minHeight}`,
      },
      handlePaste(view, event) {
        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;

        event.preventDefault();
        imageFiles.forEach(async file => {
          const url = await uploadImage(file);
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        });

        return true;
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;

        event.preventDefault();
        imageFiles.forEach(async file => {
          const url = await uploadImage(file);
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        });

        return true;
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const addLink = () => {
    const url = window.prompt('링크 URL을 입력하세요');
    if (!url || !editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = input.files;
      if (!files || !editor) return;

      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };
    input.click();
  };

  if (!editor) return null;

  const primaryButtons: ToolbarButtonProps[] = [
    {
      label: 'H1',
      title: '제목 1',
      active: editor.isActive('heading', { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'H2',
      title: '제목 2',
      active: editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      title: '제목 3',
      active: editor.isActive('heading', { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: 'B',
      title: '굵게',
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      title: '기울임',
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: '링크',
      title: '링크 삽입',
      active: editor.isActive('link'),
      onClick: addLink,
    },
    {
      label: '이미지',
      title: '이미지 업로드',
      onClick: () => void addImage(),
      tone: 'accent',
    },
  ];

  const blockButtons: ToolbarButtonProps[] = [
    {
      label: '텍스트',
      title: '문단',
      active: editor.isActive('paragraph'),
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: '목록',
      title: '순서 없는 목록',
      active: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '번호',
      title: '순서 있는 목록',
      active: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '인용',
      title: '인용문',
      active: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: '코드',
      title: '코드 블록',
      active: editor.isActive('codeBlock'),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: '구분선',
      title: '구분선',
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  const mobileButtons = blockButtons.slice(0, 4).concat([
    {
      label: '이미지',
      title: '이미지 업로드',
      onClick: () => void addImage(),
      tone: 'accent' as const,
    },
  ]);

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

          <div
            data-cy="post-editor-toolbar"
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {primaryButtons.map(button => (
              <ToolbarButton key={button.title} {...button} />
            ))}
          </div>

          <div
            data-cy="post-editor-quick-actions"
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {blockButtons.map(button => (
              <ToolbarButton key={button.title} {...button} />
            ))}
          </div>
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t border-surface-200 bg-surface-50 px-3 py-3 sm:hidden">
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileButtons.map(button => (
            <ToolbarButton key={`mobile-${button.title}`} {...button} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ label, title, active = false, onClick, tone = 'default' }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={event => {
        event.preventDefault();
        onClick();
      }}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        tone === 'accent'
          ? active
            ? 'bg-surface-900 text-white'
            : 'border border-surface-900 bg-surface-900 text-white hover:bg-surface-800'
          : active
            ? 'bg-surface-900 text-white'
            : 'border border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:text-surface-900'
      }`}
    >
      {label}
    </button>
  );
}
