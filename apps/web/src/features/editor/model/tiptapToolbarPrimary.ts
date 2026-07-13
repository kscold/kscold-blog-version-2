import type { Editor } from '@tiptap/react';
import type {
  ToolbarActions,
  ToolbarButtonConfig,
} from '@/features/editor/model/tiptapToolbarTypes';

export function buildPrimaryToolbarButtons(
  editor: Editor,
  actions: ToolbarActions
): ToolbarButtonConfig[] {
  return [
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
      onClick: actions.addLink,
    },
    {
      label: '동영상',
      title: 'mp4 동영상 업로드',
      onClick: actions.addVideo,
      tone: 'accent',
    },
    {
      label: '이미지',
      title: '이미지 업로드',
      onClick: actions.addImage,
      tone: 'accent',
    },
    {
      label: '가로 이미지',
      title: '이미지 가로 배치 (2~3장)',
      onClick: actions.addImageRow,
      tone: 'accent',
    },
  ];
}
