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

type MarkdownStorage = Record<string, { getMarkdown: () => string }>;

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
    // html: true 로 둬야 전처리한 <video> 태그가 Video 노드로 파싱됨
    Markdown.configure({ transformPastedText: true, html: true }),
  ];
}

export function readMarkdown(editor: Editor) {
  const storage = editor.storage as unknown as MarkdownStorage;
  return storage.markdown.getMarkdown();
}
