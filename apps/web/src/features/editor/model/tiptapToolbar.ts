import type { Editor } from '@tiptap/react';

export type ToolbarButtonConfig = {
  label: string;
  title: string;
  active?: boolean;
  onClick: () => void;
  tone?: 'default' | 'accent';
};

interface ToolbarActions {
  addLink: () => void;
  addVideo: () => void;
  addImage: () => void;
  setCodeBlockLanguage: () => void;
  setText: () => void;
  setBulletList: () => void;
  setOrderedList: () => void;
  setBlockquote: () => void;
}

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
      label: '비디오',
      title: '비디오 임베드',
      onClick: actions.addVideo,
    },
    {
      label: '이미지',
      title: '이미지 업로드',
      onClick: actions.addImage,
      tone: 'accent',
    },
  ];
}

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
