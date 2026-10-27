'use client';

import { useState, type FormEvent } from 'react';

interface SlideShowControlsProps {
  slide: number;
  slideCount: number;
  goTo: (slide: number) => void;
  move: (delta: number) => void;
  isFullscreen: boolean;
  canFullscreen: boolean;
  onToggleFullscreen: () => void;
  downloadHref: string;
  downloadName: string;
}

const BUTTON =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-bold transition-colors disabled:opacity-30';

export function SlideShowControls(props: SlideShowControlsProps) {
  const { slide, slideCount, goTo } = props;
  const [draft, setDraft] = useState('');

  const onJump = (event: FormEvent) => {
    event.preventDefault();
    const target = Number.parseInt(draft, 10);
    if (Number.isFinite(target)) goTo(target);
    setDraft('');
  };

  return (
    <footer className="flex flex-wrap items-center justify-center gap-2 px-4 pb-4 pt-2">
      <button
        type="button"
        onClick={() => props.move(-1)}
        disabled={slide <= 1}
        className={`${BUTTON} bg-white/10 hover:bg-white/20`}
        aria-label="이전 슬라이드"
      >
        ←
      </button>
      <form
        onSubmit={onJump}
        className="flex items-center gap-1 font-mono text-sm text-surface-300"
      >
        <label className="sr-only" htmlFor="slide-jump">
          이동할 슬라이드 번호
        </label>
        <input
          id="slide-jump"
          inputMode="numeric"
          value={draft}
          onChange={event => setDraft(event.target.value.replace(/\D/g, ''))}
          placeholder={String(slide)}
          className="h-11 w-14 rounded-full bg-white/10 text-center text-white placeholder:text-surface-300 focus:outline-hidden focus:ring-2 focus:ring-primary-400"
        />
        <span>/ {slideCount || '–'}</span>
      </form>
      <button
        type="button"
        onClick={() => props.move(1)}
        disabled={!slideCount || slide >= slideCount}
        className={`${BUTTON} bg-white text-surface-900 hover:bg-primary-100`}
        aria-label="다음 슬라이드"
      >
        →
      </button>
      {props.canFullscreen && (
        <button
          type="button"
          onClick={props.onToggleFullscreen}
          className={`${BUTTON} bg-white/10 hover:bg-white/20`}
        >
          {props.isFullscreen ? '전체 화면 끝내기' : '전체 화면 (F)'}
        </button>
      )}
      <a
        href={props.downloadHref}
        download={props.downloadName}
        className={`${BUTTON} text-surface-300 hover:text-white`}
      >
        PDF 받기
      </a>
    </footer>
  );
}
