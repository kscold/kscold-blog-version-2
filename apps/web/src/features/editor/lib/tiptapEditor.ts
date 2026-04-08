import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';

const lowlight = createLowlight(common);

const editorSurfaceClassName =
  'tiptap-editor-surface prose prose-slate max-w-none min-h-[420px] px-5 py-6 text-[15px] leading-7 text-surface-800 focus:outline-none sm:min-h-[520px] sm:px-8 sm:py-8 sm:text-base prose-headings:font-black prose-headings:tracking-tight prose-headings:text-surface-900 prose-p:text-surface-700 prose-li:text-surface-700 prose-blockquote:border-l-surface-300 prose-blockquote:text-surface-500 prose-code:text-surface-900 prose-pre:rounded-2xl prose-pre:bg-surface-950 prose-pre:text-surface-100 prose-img:rounded-2xl prose-img:shadow-sm';

type UploadImage = (file: File) => Promise<string | null>;
type MarkdownStorage = Record<string, { getMarkdown: () => string }>;

async function insertImageFiles(editor: Editor | null, files: File[], uploadImage: UploadImage) {
  if (!editor) return;

  for (const file of files) {
    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }
}

export function buildEditorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    CodeBlockLowlight.configure({ lowlight }),
    ImageExtension.configure({ inline: false, allowBase64: false }),
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder }),
    Markdown.configure({ transformPastedText: true }),
  ];
}

export function buildEditorProps(
  minHeight: string,
  getEditor: () => Editor | null,
  uploadImage: UploadImage
) {
  return {
    attributes: {
      class: editorSurfaceClassName,
      style: `min-height: ${minHeight}`,
    },
    handlePaste(view: unknown, event: ClipboardEvent) {
      const files = event.clipboardData?.files;
      if (!files?.length) return false;

      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (!imageFiles.length) return false;

      event.preventDefault();
      void insertImageFiles(getEditor(), imageFiles, uploadImage);
      return true;
    },
    handleDrop(view: unknown, event: DragEvent) {
      const files = event.dataTransfer?.files;
      if (!files?.length) return false;

      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (!imageFiles.length) return false;

      event.preventDefault();
      void insertImageFiles(getEditor(), imageFiles, uploadImage);
      return true;
    },
  };
}

export function readMarkdown(editor: Editor) {
  const storage = editor.storage as unknown as MarkdownStorage;
  return storage.markdown.getMarkdown();
}

export function promptLinkUrl(editor: Editor | null) {
  if (!editor) return;

  const url = window.prompt('링크 URL을 입력하세요');
  if (!url) return;

  editor.chain().focus().setLink({ href: url }).run();
}

export function promptCodeBlockLanguage(editor: Editor | null) {
  if (!editor) return;

  const currentLanguage = String(editor.getAttributes('codeBlock').language || '');
  const nextLanguage = window.prompt(
    '코드 언어를 입력하세요 (예: ts, java, bash)',
    currentLanguage
  );

  if (nextLanguage === null) return;

  const normalizedLanguage = nextLanguage.trim().toLowerCase();
  const chain = editor.chain().focus();

  if (!editor.isActive('codeBlock')) {
    chain.setCodeBlock();
  }

  chain.updateAttributes('codeBlock', { language: normalizedLanguage || null }).run();
}

export async function promptImageUpload(editor: Editor | null, uploadImage: UploadImage) {
  if (!editor) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async () => {
    const files = Array.from(input.files || []);
    await insertImageFiles(editor, files, uploadImage);
  };
  input.click();
}
