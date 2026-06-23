import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { ImageRowExtension } from '@/features/editor/extensions/imageRow';
import { VideoExtension } from '@/features/editor/extensions/video';
import { SlashCommand, type SlashCommandActions } from '@/features/editor/extensions/slashCommand';

const lowlight = createLowlight(common);

// 단독 줄에 놓인 동영상 URL (mp4/webm/mov)
const STANDALONE_VIDEO_RE = /^(https?:\/\/\S+\.(?:mp4|webm|mov)(?:\?\S*)?)[ \t]*$/gim;

/**
 * 에디터에 마크다운을 로드하기 전에, 단독 줄로 놓인 동영상 URL을
 * <video> HTML로 바꿔 Video 노드로 인식되게 한다. (편집 시 미리보기 + 보존)
 */
export function preprocessEditorMarkdown(markdown: string): string {
  return markdown.replace(STANDALONE_VIDEO_RE, '<video src="$1"></video>');
}

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

export function buildEditorExtensions(placeholder: string, slashActions?: SlashCommandActions) {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    CodeBlockLowlight.configure({ lowlight }),
    ImageExtension.configure({ inline: false, allowBase64: false }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    ImageRowExtension,
    VideoExtension,
    // 노션식 '/' 블록 메뉴 — 미디어 삽입 액션은 에디터 컴포넌트가 주입
    SlashCommand.configure(slashActions ?? {}),
    Link.configure({ openOnClick: false, autolink: true }),
    // 현재 빈 블록에만 안내를 띄운다 (제목은 "제목 N", 그 외엔 '/' 안내)
    Placeholder.configure({
      includeChildren: false,
      placeholder: ({ node }) =>
        node.type.name === 'heading'
          ? `제목 ${node.attrs.level}`
          : placeholder,
    }),
    // 노션식 블록 드래그 핸들 — hover 시 블록 왼쪽 ⠿ 핸들로 순서 변경
    GlobalDragHandle.configure({ dragHandleWidth: 24 }),
    // html: true 로 둬야 전처리한 <video> 태그가 Video 노드로 파싱된다
    Markdown.configure({ transformPastedText: true, html: true }),
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

const VIDEO_FILE_URL_RE = /\.(mp4|webm|mov)(\?\S*)?$/i;

function insertVideoOrEmbed(editor: Editor, url: string) {
  if (VIDEO_FILE_URL_RE.test(url)) {
    // mp4/webm/mov 직접 링크 → Video 노드 (미리보기 + 보존)
    editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
  } else {
    // YouTube/Vimeo/Loom 등 → 단독 URL 문단 (프론트가 임베드로 렌더)
    editor
      .chain()
      .focus()
      .insertContent([
        { type: 'paragraph', content: [{ type: 'text', text: url }] },
        { type: 'paragraph' },
      ])
      .run();
  }
}

export function promptVideoUrl(editor: Editor | null) {
  if (!editor) return;

  const url = window.prompt('비디오 URL을 입력하세요 (mp4 직접 링크 · YouTube · Vimeo · Loom)');
  if (!url) return;

  insertVideoOrEmbed(editor, url.trim());
}

/** mp4/webm/mov 파일을 업로드해 Video 노드로 삽입한다. */
export async function promptVideoUpload(editor: Editor | null, uploadFile: UploadImage) {
  if (!editor) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/mp4,video/webm,video/quicktime,video/*';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
    }
  };
  input.click();
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

export async function promptImageRowUpload(editor: Editor | null, uploadImage: UploadImage) {
  if (!editor) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async () => {
    const files = Array.from(input.files || []).slice(0, 3);
    if (!files.length) return;

    const srcs: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) srcs.push(url);
    }
    if (srcs.length > 0) {
      editor.chain().focus().insertContent({ type: 'imageRow', attrs: { srcs } }).run();
    }
  };
  input.click();
}
