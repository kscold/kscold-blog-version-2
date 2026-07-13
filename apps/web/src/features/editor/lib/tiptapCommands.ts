import type { Editor } from '@tiptap/react';

export type UploadImage = (file: File) => Promise<string | null>;

export async function insertImageFiles(
  editor: Editor | null,
  files: File[],
  uploadImage: UploadImage
) {
  if (!editor) return;

  for (const file of files) {
    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }
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
