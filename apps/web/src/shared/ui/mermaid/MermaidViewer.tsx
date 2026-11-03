'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useMermaidViewport } from './useMermaidViewport';

interface MermaidViewerProps {
  svg: string;
  theme: 'light' | 'dark';
  onClose: () => void;
}

function useMermaidDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    };
  }, []);
  return dialogRef;
}

function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]');
  const first = controls[0];
  const last = controls[controls.length - 1];
  // 브라우저 도구 모음으로 탭이 빠지지 않게 확대 창 안에서 순환한다.
  const target = event.shiftKey && document.activeElement === first ? last
    : !event.shiftKey && document.activeElement === last ? first : null;
  if (target) {
    event.preventDefault();
    target.focus();
  }
}

export function MermaidViewer({ svg, theme, onClose }: MermaidViewerProps) {
  const dialogRef = useMermaidDialog();
  const { viewportRef, width, scale, minScale, changeZoom, reset } = useMermaidViewport(svg);
  const isDark = theme === 'dark';
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label="도표 크게 보기"
      aria-modal="true"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={containDialogFocus}
      className={`fixed inset-0 m-auto h-dvh max-h-dvh w-screen max-w-none flex-col overflow-hidden border-0 p-0 shadow-xl backdrop:bg-surface-950/60 open:flex sm:h-[90dvh] sm:w-[calc(100vw-3rem)] sm:max-w-7xl sm:rounded-2xl ${isDark ? 'bg-surface-950 text-surface-100' : 'bg-white text-surface-900'}`}
    >
      <MermaidViewerControls viewport={{ scale, minScale, changeZoom, reset }} onClose={onClose} />
      <div
        ref={viewportRef}
        role="region"
        aria-label="확대한 도표"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto overscroll-contain p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
      >
        <div
          className="mermaid-diagram mermaid-expanded mx-auto"
          style={{ width }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <p className="shrink-0 px-4 py-3 text-center text-xs text-surface-500">
        확대 후 스크롤해서 도표를 이동할 수 있어요.
      </p>
    </dialog>,
    document.body,
  );
}

function MermaidViewerControls({ viewport, onClose }: {
  viewport: Pick<ReturnType<typeof useMermaidViewport>, 'scale' | 'minScale' | 'changeZoom' | 'reset'>;
  onClose: () => void;
}) {
  const buttonClass = 'min-h-11 min-w-11 rounded-lg border border-surface-300/50 px-3 text-sm font-medium hover:bg-surface-300/20 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-40';
  return (
    <div className="shrink-0 border-b border-surface-300/50 p-3 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">도표 크게 보기</h2>
        <button type="button" onClick={onClose} className={buttonClass}>닫기</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="도표 축소" disabled={viewport.scale <= viewport.minScale} onClick={() => viewport.changeZoom(1 / 1.25)} className={buttonClass}>−</button>
        <output aria-label="도표 배율" className="w-12 text-center text-sm tabular-nums">{Math.round(viewport.scale * 100)}%</output>
        <button type="button" aria-label="도표 확대" disabled={viewport.scale >= 3} onClick={() => viewport.changeZoom(1.25)} className={buttonClass}>+</button>
        <button type="button" onClick={() => viewport.reset('fit')} className={buttonClass}>화면 맞춤</button>
        <button type="button" onClick={() => viewport.reset(1)} className={buttonClass}>원본 크기</button>
      </div>
    </div>
  );
}
