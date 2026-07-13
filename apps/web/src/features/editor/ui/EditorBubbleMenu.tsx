'use client';

import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { promptLinkUrl } from '@/features/editor/lib/tiptapEditor';

export function EditorBubbleMenu({ editor }: { editor: Editor }) {
  return (
    // 노션식 버블 메뉴 — 텍스트를 선택하면 떠오르는 서식 툴바
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top', offset: 10 }}
      shouldShow={({ editor: ed, state }) => {
        const { empty } = state.selection;
        if (empty) return false;
        if (ed.isActive('codeBlock') || ed.isActive('image') || ed.isActive('imageRow') || ed.isActive('video')) {
          return false;
        }
        return true;
      }}
    >
      <div className="flex items-center overflow-hidden rounded-xl border border-surface-200 bg-white/95 shadow-lg backdrop-blur-sm">
        {[
          {
            label: 'B',
            title: '굵게',
            active: editor.isActive('bold'),
            className: 'font-black',
            onClick: () => editor.chain().focus().toggleBold().run(),
          },
          {
            label: 'I',
            title: '기울임',
            active: editor.isActive('italic'),
            className: 'italic font-serif',
            onClick: () => editor.chain().focus().toggleItalic().run(),
          },
          {
            label: 'S',
            title: '취소선',
            active: editor.isActive('strike'),
            className: 'line-through',
            onClick: () => editor.chain().focus().toggleStrike().run(),
          },
          {
            label: '</>',
            title: '인라인 코드',
            active: editor.isActive('code'),
            className: 'font-mono text-[11px]',
            onClick: () => editor.chain().focus().toggleCode().run(),
          },
          {
            label: '링크',
            title: '링크',
            active: editor.isActive('link'),
            className: 'text-xs font-bold',
            onClick: () => promptLinkUrl(editor),
          },
        ].map(btn => (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            onClick={btn.onClick}
            className={`flex h-9 min-w-9 items-center justify-center px-2.5 text-sm transition-colors ${btn.className} ${
              btn.active
                ? 'bg-surface-900 text-white'
                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </BubbleMenu>
  );
}
