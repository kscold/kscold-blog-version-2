import type { Editor } from '@tiptap/react';
import { insertImageFiles, type UploadImage } from '@/features/editor/lib/tiptapCommands';

const editorSurfaceClassName =
  'tiptap-editor-surface prose prose-slate max-w-none min-h-[420px] px-5 py-6 text-[15px] leading-7 text-surface-800 focus:outline-none sm:min-h-[520px] sm:px-8 sm:py-8 sm:text-base prose-headings:font-black prose-headings:tracking-tight prose-headings:text-surface-900 prose-p:text-surface-700 prose-li:text-surface-700 prose-blockquote:border-l-surface-300 prose-blockquote:text-surface-500 prose-code:text-surface-900 prose-pre:rounded-2xl prose-pre:bg-surface-950 prose-pre:text-surface-100 prose-img:rounded-2xl prose-img:shadow-sm';

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
