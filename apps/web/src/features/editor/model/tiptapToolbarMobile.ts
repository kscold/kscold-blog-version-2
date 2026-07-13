import type { Editor } from '@tiptap/react';
import type {
  ToolbarActions,
  ToolbarButtonConfig,
} from '@/features/editor/model/tiptapToolbarTypes';

export function buildMobileToolbarButtons(actions: ToolbarActions): ToolbarButtonConfig[] {
  return [
    {
      label: '텍스트',
      title: '문단',
      onClick: actions.setText,
    },
    {
      label: '목록',
      title: '순서 없는 목록',
      onClick: actions.setBulletList,
    },
    {
      label: '번호',
      title: '순서 있는 목록',
      onClick: actions.setOrderedList,
    },
    {
      label: '인용',
      title: '인용문',
      onClick: actions.setBlockquote,
    },
    {
      label: '이미지',
      title: '이미지 업로드',
      onClick: actions.addImage,
      tone: 'accent',
    },
  ];
}

export function buildMobileToolbarButtonsForEditor(
  editor: Editor,
  actions: ToolbarActions
): ToolbarButtonConfig[] {
  return [
    {
      label: '텍스트',
      title: '문단',
      active: editor.isActive('paragraph'),
      onClick: actions.setText,
    },
    {
      label: '목록',
      title: '순서 없는 목록',
      active: editor.isActive('bulletList'),
      onClick: actions.setBulletList,
    },
    {
      label: '번호',
      title: '순서 있는 목록',
      active: editor.isActive('orderedList'),
      onClick: actions.setOrderedList,
    },
    {
      label: '인용',
      title: '인용문',
      active: editor.isActive('blockquote'),
      onClick: actions.setBlockquote,
    },
    {
      label: '이미지',
      title: '이미지 업로드',
      onClick: actions.addImage,
      tone: 'accent',
    },
  ];
}
