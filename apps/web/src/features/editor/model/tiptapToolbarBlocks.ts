import type { Editor } from '@tiptap/react';
import type {
  ToolbarActions,
  ToolbarButtonConfig,
} from '@/features/editor/model/tiptapToolbarTypes';

export function buildBlockToolbarButtons(
  editor: Editor,
  actions: ToolbarActions
): ToolbarButtonConfig[] {
  const currentCodeLanguage = String(editor.getAttributes('codeBlock').language || '');

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
      label: '코드',
      title: '코드 블록',
      active: editor.isActive('codeBlock'),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: currentCodeLanguage ? currentCodeLanguage.toUpperCase() : '언어',
      title: '코드 언어 설정',
      active: editor.isActive('codeBlock'),
      onClick: actions.setCodeBlockLanguage,
    },
    {
      label: '구분선',
      title: '구분선',
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];
}
