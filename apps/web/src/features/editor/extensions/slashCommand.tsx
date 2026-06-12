'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type ReactNode,
} from 'react';
import { Extension, ReactRenderer, type Editor, type Range } from '@tiptap/react';
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from '@tiptap/suggestion';

/** 슬래시 메뉴에서 실행되는 블록 삽입 액션 — 미디어류는 TiptapEditor가 주입한다 */
export interface SlashCommandActions {
  insertImage?: (editor: Editor) => void;
  insertImageRow?: (editor: Editor) => void;
  insertVideo?: (editor: Editor) => void;
}

interface CommandItem {
  title: string;
  description: string;
  /** 검색 매칭용 (영문·한글 별칭) */
  keywords: string;
  /** 노션풍 미니 프리뷰 글리프 */
  glyph: ReactNode;
  run: (editor: Editor, actions: SlashCommandActions) => void;
}

const baseCommands: CommandItem[] = [
  {
    title: '텍스트',
    description: '일반 문단으로 씁니다.',
    keywords: 'text paragraph 텍스트 문단 본문 p',
    glyph: <span className="text-[15px] font-medium">Aa</span>,
    run: editor => editor.chain().focus().setParagraph().run(),
  },
  {
    title: '제목 1',
    description: '큰 섹션 제목',
    keywords: 'heading1 h1 제목 헤딩 큰제목',
    glyph: <span className="text-[15px] font-black">H1</span>,
    run: editor => editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    title: '제목 2',
    description: '중간 섹션 제목',
    keywords: 'heading2 h2 제목 헤딩',
    glyph: <span className="text-[14px] font-black">H2</span>,
    run: editor => editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    title: '제목 3',
    description: '작은 섹션 제목',
    keywords: 'heading3 h3 제목 헤딩',
    glyph: <span className="text-[13px] font-black">H3</span>,
    run: editor => editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    title: '글머리 목록',
    description: '순서 없는 목록을 만듭니다.',
    keywords: 'bullet list 목록 리스트 ul',
    glyph: <span className="text-[15px]">•</span>,
    run: editor => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: '번호 목록',
    description: '순서 있는 목록을 만듭니다.',
    keywords: 'numbered ordered list 번호 목록 ol',
    glyph: <span className="text-[12px] font-bold font-mono">1.</span>,
    run: editor => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: '인용',
    description: '인용문 블록을 만듭니다.',
    keywords: 'quote blockquote 인용 인용문',
    glyph: <span className="text-[17px] font-serif leading-none">&ldquo;</span>,
    run: editor => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: '코드 블록',
    description: '코드를 구문 강조와 함께 넣습니다.',
    keywords: 'code codeblock 코드 코드블록',
    glyph: <span className="text-[12px] font-mono font-bold">&lt;/&gt;</span>,
    run: editor => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: '구분선',
    description: '내용을 구분하는 가로선',
    keywords: 'divider hr horizontal rule 구분선 라인',
    glyph: <span className="text-[15px] font-bold">—</span>,
    run: editor => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: '이미지',
    description: '이미지를 업로드해 넣습니다.',
    keywords: 'image picture photo 이미지 사진 그림',
    glyph: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z"
        />
      </svg>
    ),
    run: (editor, actions) => actions.insertImage?.(editor),
  },
  {
    title: '가로 이미지',
    description: '이미지 2~3장을 나란히 배치합니다.',
    keywords: 'image row gallery 가로 이미지 갤러리 나란히',
    glyph: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25h5.25v13.5H3zM9.75 5.25H15v13.5H9.75zM16.5 5.25h4.5v13.5h-4.5z" />
      </svg>
    ),
    run: (editor, actions) => actions.insertImageRow?.(editor),
  },
  {
    title: '동영상',
    description: 'mp4 동영상을 업로드해 넣습니다.',
    keywords: 'video mp4 동영상 비디오 영상',
    glyph: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
        />
      </svg>
    ),
    run: (editor, actions) => actions.insertVideo?.(editor),
  },
];

function filterCommands(query: string): CommandItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return baseCommands;
  return baseCommands.filter(
    item => item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
  );
}

/* ─────────────── 메뉴 뷰 (노션풍 팝오버) ─────────────── */

interface SlashMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

interface SlashMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashMenu(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') {
        setSelected(prev => (prev + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'ArrowUp') {
        setSelected(prev => (prev - 1 + items.length) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'Enter') {
        if (items[selected]) command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="w-72 rounded-2xl border border-surface-200 bg-white p-3 text-sm text-surface-400 shadow-xl">
        일치하는 블록이 없습니다
      </div>
    );
  }

  return (
    <div className="slash-menu w-72 max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-surface-200 bg-white p-1.5 shadow-xl">
      <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-surface-400">
        블록
      </p>
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => command(item)}
          onMouseEnter={() => setSelected(index)}
          className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
            index === selected ? 'bg-surface-100' : 'bg-transparent'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-200 bg-surface-50 text-surface-600">
            {item.glyph}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-surface-900">{item.title}</span>
            <span className="block truncate text-xs text-surface-400">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

/* ─────────────── Suggestion 연결 ─────────────── */

function positionMenu(element: HTMLElement, clientRect: DOMRect | null) {
  if (!clientRect) return;
  const menuHeight = Math.min(element.offsetHeight || 320, 320);
  const below = clientRect.bottom + 8;
  const flip = below + menuHeight > window.innerHeight && clientRect.top - menuHeight - 8 > 0;
  element.style.position = 'fixed';
  element.style.zIndex = '60';
  element.style.left = `${Math.min(clientRect.left, window.innerWidth - 300)}px`;
  element.style.top = flip ? `${clientRect.top - menuHeight - 8}px` : `${below}px`;
}

export const SlashCommand = Extension.create<SlashCommandActions>({
  name: 'slashCommand',

  addOptions() {
    return {};
  },

  addProseMirrorPlugins() {
    const actions = this.options;

    return [
      Suggestion<CommandItem>({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        allow: ({ state }) => {
          const { $from } = state.selection;
          return $from.parent.type.name !== 'codeBlock';
        },
        items: ({ query }) => filterCommands(query),
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range as Range).run();
          props.run(editor as Editor, actions);
        },
        render: () => {
          let component: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null = null;

          return {
            onStart: (props: SuggestionProps<CommandItem>) => {
              component = new ReactRenderer(SlashMenu, {
                props: { items: props.items, command: props.command },
                editor: props.editor,
              });
              document.body.appendChild(component.element);
              positionMenu(component.element as HTMLElement, props.clientRect?.() ?? null);
            },
            onUpdate: (props: SuggestionProps<CommandItem>) => {
              component?.updateProps({ items: props.items, command: props.command });
              if (component) {
                positionMenu(component.element as HTMLElement, props.clientRect?.() ?? null);
              }
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === 'Escape') {
                component?.destroy();
                component?.element.remove();
                component = null;
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              component?.element.remove();
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});
