'use client';

import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';

/** 슬래시 메뉴에서 실행되는 블록 삽입 액션 — 미디어류는 TiptapEditor가 주입한다 */
export interface SlashCommandActions {
  insertImage?: (editor: Editor) => void;
  insertImageRow?: (editor: Editor) => void;
  insertVideo?: (editor: Editor) => void;
}

/**
 * 슬래시 메뉴 블록 명령 체인.
 * 모듈 증강(ChainedCommands)이 이 파일에서 안정적으로 로드되지 않아,
 * 런타임에 존재하는 메서드와 동일한 시그니처를 명시해 사용한다.
 */
interface BlockChain {
  setParagraph(): BlockChain;
  setHeading(attrs: { level: 1 | 2 | 3 }): BlockChain;
  toggleBulletList(): BlockChain;
  toggleOrderedList(): BlockChain;
  toggleBlockquote(): BlockChain;
  toggleCodeBlock(): BlockChain;
  setHorizontalRule(): BlockChain;
  run(): boolean;
}

const blockChain = (editor: Editor): BlockChain =>
  editor.chain().focus() as unknown as BlockChain;

export interface CommandItem {
  title: string;
  description: string;
  /** 검색 매칭용 (영문·한글 별칭) */
  keywords: string;
  /** 노션풍 미니 프리뷰 글리프 */
  glyph: ReactNode;
  run: (editor: Editor, actions: SlashCommandActions) => void;
}

export const baseCommands: CommandItem[] = [
  {
    title: '텍스트',
    description: '일반 문단으로 씁니다.',
    keywords: 'text paragraph 텍스트 문단 본문 p',
    glyph: <span className="text-[15px] font-medium">Aa</span>,
    run: editor => blockChain(editor).setParagraph().run(),
  },
  {
    title: '제목 1',
    description: '큰 섹션 제목',
    keywords: 'heading1 h1 제목 헤딩 큰제목',
    glyph: <span className="text-[15px] font-black">H1</span>,
    run: editor => blockChain(editor).setHeading({ level: 1 }).run(),
  },
  {
    title: '제목 2',
    description: '중간 섹션 제목',
    keywords: 'heading2 h2 제목 헤딩',
    glyph: <span className="text-[14px] font-black">H2</span>,
    run: editor => blockChain(editor).setHeading({ level: 2 }).run(),
  },
  {
    title: '제목 3',
    description: '작은 섹션 제목',
    keywords: 'heading3 h3 제목 헤딩',
    glyph: <span className="text-[13px] font-black">H3</span>,
    run: editor => blockChain(editor).setHeading({ level: 3 }).run(),
  },
  {
    title: '글머리 목록',
    description: '순서 없는 목록을 만듭니다.',
    keywords: 'bullet list 목록 리스트 ul',
    glyph: <span className="text-[15px]">•</span>,
    run: editor => blockChain(editor).toggleBulletList().run(),
  },
  {
    title: '번호 목록',
    description: '순서 있는 목록을 만듭니다.',
    keywords: 'numbered ordered list 번호 목록 ol',
    glyph: <span className="text-[12px] font-bold font-mono">1.</span>,
    run: editor => blockChain(editor).toggleOrderedList().run(),
  },
  {
    title: '인용',
    description: '인용문 블록을 만듭니다.',
    keywords: 'quote blockquote 인용 인용문',
    glyph: <span className="text-[17px] font-serif leading-none">&ldquo;</span>,
    run: editor => blockChain(editor).toggleBlockquote().run(),
  },
  {
    title: '코드 블록',
    description: '코드를 구문 강조와 함께 넣습니다.',
    keywords: 'code codeblock 코드 코드블록',
    glyph: <span className="text-[12px] font-mono font-bold">&lt;/&gt;</span>,
    run: editor => blockChain(editor).toggleCodeBlock().run(),
  },
  {
    title: '구분선',
    description: '내용을 구분하는 가로선',
    keywords: 'divider hr horizontal rule 구분선 라인',
    glyph: <span className="text-[15px] font-bold">—</span>,
    run: editor => blockChain(editor).setHorizontalRule().run(),
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

export function filterCommands(query: string): CommandItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return baseCommands;
  return baseCommands.filter(
    item => item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
  );
}
