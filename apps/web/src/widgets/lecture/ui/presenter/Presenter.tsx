'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {
  PDF_DOCUMENT_OPTIONS,
  configurePdfWorker,
  limitedPixelRatio,
} from '@/shared/lib/pdf/pdfjsOptions';
import type { PresenterSlide } from '../../model/presenterSlide';
import {
  formatClock,
  formatElapsed,
  scheduleGap,
  useElapsedTimer,
  useNow,
  useScreenWakeLock,
  useScriptFontSize,
} from '../../model/usePresenter';
import {
  useFullscreen,
  useSlideKeys,
  useSlideNavigation,
  useStageFit,
  useSwipe,
} from '../../model/useSlideShow';

configurePdfWorker();

interface PresenterProps {
  slides: PresenterSlide[];
  /** 관리자만 받을 수 있는 강사용 PDF 주소 */
  deckHref: string;
  title: string;
}

/**
 * 강사 발표 화면. 아이패드 가로 화면 기준으로 왼쪽에 지금 장과 대본, 오른쪽에 다음 장과 활동·예상 답을 둔다.
 * 세로 화면에서도 같은 배치를 두 칸으로 유지하고, 휴대폰 폭에서는 한 줄로 쌓는다.
 * 장 번호는 주소의 #번호로 기억해 새로고침해도 같은 장에서 다시 연다.
 */
export default function Presenter({ slides, deckHref, title }: PresenterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [pdfError, setPdfError] = useState(false);
  const navigation = useSlideNavigation();
  const { slide, goTo, move, onLoaded } = navigation;
  const slideCount = slides.length;
  const fullscreen = useFullscreen(rootRef);
  const stage = useStageFit(stageRef, aspectRatio);
  const preview = useStageFit(nextRef, aspectRatio);
  const font = useScriptFontSize();
  const timer = useElapsedTimer();
  const now = useNow();

  useScreenWakeLock();
  useSlideKeys({ goTo, move, slideCount, toggleFullscreen: fullscreen.toggle });
  useSwipe(
    stageRef,
    useCallback(direction => move(direction), [move])
  );

  // PDF를 못 받아도 대본만으로 넘길 수 있게 장 수는 대본 기준으로 먼저 정한다.
  useEffect(() => onLoaded(slideCount), [onLoaded, slideCount]);

  const current = slides[slide - 1] ?? slides[0];
  const next = slides[slide] ?? null;
  const gap = scheduleGap(current.time, now);

  const onLoad = (pdf: PDFDocumentProxy) => {
    void pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      setAspectRatio(viewport.width / viewport.height);
    });
  };

  // 지금 장의 왼쪽 1/3을 누르면 앞으로, 나머지를 누르면 다음 장으로 간다.
  const onStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a')) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    move(event.clientX - left < width / 3 ? -1 : 1);
  };

  const onTimerClick = () => {
    if (!timer.startedAt) timer.start();
    else if (window.confirm('경과 시간을 0으로 되돌릴까요?')) timer.reset();
  };

  return (
    <div
      ref={rootRef}
      data-testid="presenter"
      className="flex h-[100dvh] flex-col bg-surface-950 text-surface-100"
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 px-4 py-2.5 text-sm">
        <p className="font-mono text-base font-bold text-white" aria-live="polite">
          <span data-testid="presenter-position">{slide}</span>
          <span className="text-surface-500"> / {slideCount}</span>
        </p>
        <p className="min-w-0 flex-1 truncate text-surface-400">{current.part || title}</p>
        <p className="flex items-center gap-2 tabular-nums">
          <span className="text-surface-400">예정</span>
          <span className="font-bold text-white">{current.time || '—'}</span>
          {current.minutes > 0 && <span className="text-surface-400">· {current.minutes}분</span>}
          {gap !== null && gap !== 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-bold ${gap > 0 ? 'bg-amber-400 text-surface-950' : 'bg-sky-400 text-surface-950'}`}
            >
              {gap > 0 ? `${gap}분 늦음` : `${-gap}분 빠름`}
            </span>
          )}
        </p>
        <p className="font-mono text-lg font-bold tabular-nums text-white" aria-label="지금 시각">
          {formatClock(now)}
        </p>
        <button
          type="button"
          onClick={onTimerClick}
          className="min-h-10 rounded-md bg-white/10 px-3 font-mono font-bold tabular-nums text-white hover:bg-white/20"
          aria-label={timer.startedAt ? '경과 시간 (누르면 초기화)' : '경과 시간 재기 시작'}
        >
          {timer.startedAt ? formatElapsed(now - timer.startedAt) : '시간 재기'}
        </button>
        {fullscreen.isSupported && (
          <button
            type="button"
            onClick={fullscreen.toggle}
            className="min-h-10 rounded-md bg-white/10 px-3 font-bold text-white hover:bg-white/20"
          >
            {fullscreen.isFullscreen ? '전체 화면 끝' : '전체 화면'}
          </button>
        )}
      </header>

      <Document
        file={deckHref}
        options={PDF_DOCUMENT_OPTIONS}
        externalLinkTarget="_blank"
        externalLinkRel="noopener noreferrer"
        onLoadSuccess={onLoad}
        onLoadError={() => setPdfError(true)}
        onSourceError={() => setPdfError(true)}
        loading={null}
        error={null}
        className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:grid-rows-[auto_minmax(0,1fr)] sm:overflow-hidden"
      >
        {/* 지금 장 */}
        <section aria-label="지금 장" className="min-w-0">
          <div
            ref={stageRef}
            onClick={onStageClick}
            className="flex aspect-video max-h-[52dvh] w-full cursor-pointer select-none items-center justify-center"
          >
            {pdfError ? (
              <SlideFallback slide={current} />
            ) : (
              stage.width > 0 && (
                <div className="relative" style={{ width: stage.width, height: stage.height }}>
                  {/* 앞뒤 장을 미리 그려 두어 넘길 때 빈 화면 없이 바로 바뀌게 한다. */}
                  {[slide - 1, slide, slide + 1]
                    .filter(page => page >= 1 && page <= slideCount)
                    .map(page => (
                      <div
                        key={page}
                        data-testid={page === slide ? 'presenter-current' : undefined}
                        aria-hidden={page !== slide}
                        className={`absolute inset-0 ${page === slide ? '' : 'pointer-events-none opacity-0'}`}
                      >
                        <DeckPage pageNumber={page} width={stage.width} links={page === slide} />
                      </div>
                    ))}
                </div>
              )
            )}
          </div>
        </section>

        {/* 다음 장 */}
        <section aria-label="다음 장" className="flex min-w-0 flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-surface-500">다음</p>
          <div ref={nextRef} className="flex aspect-video max-h-[30dvh] w-full items-start">
            {next ? (
              pdfError ? (
                <SlideFallback slide={next} small />
              ) : (
                preview.width > 0 && (
                  <div
                    data-testid="presenter-next"
                    style={{ width: preview.width, height: preview.height }}
                  >
                    <DeckPage pageNumber={next.number} width={preview.width} links={false} />
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-surface-400">마지막 장입니다.</p>
            )}
          </div>
          {next && (
            <div className="space-y-1">
              {next.part !== current.part && next.part && (
                <p className="inline-block rounded bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
                  여기서부터 {next.part}
                </p>
              )}
              <p
                data-testid="presenter-next-title"
                className="whitespace-pre-line break-keep font-bold leading-snug text-white"
              >
                {next.number}. {next.title}
              </p>
              <p className="text-sm tabular-nums text-surface-400">
                {next.time}
                {next.minutes > 0 && ` · ${next.minutes}분`}
              </p>
              <p className="line-clamp-2 break-keep text-sm leading-6 text-surface-300">
                <span className="font-bold text-surface-400">첫마디 </span>
                {firstSentence(next.script)}
              </p>
            </div>
          )}
        </section>

        {/* 대본 */}
        <section
          aria-label="대본"
          className="flex min-h-[40dvh] min-w-0 flex-col rounded-lg bg-white/[0.04] sm:min-h-0"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
            <h2 className="min-w-0 flex-1 truncate whitespace-nowrap font-bold text-white">
              {current.title.replace(/\n/g, ' ')}
            </h2>
            {current.instructorOnly && (
              <span className="shrink-0 rounded bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-surface-950">
                강사용 장
              </span>
            )}
            <button
              type="button"
              onClick={font.smaller}
              disabled={!font.canShrink}
              aria-label="대본 글자 작게"
              className="size-10 shrink-0 rounded-md bg-white/10 font-bold text-white hover:bg-white/20 disabled:opacity-30"
            >
              가-
            </button>
            <button
              type="button"
              onClick={font.larger}
              disabled={!font.canGrow}
              aria-label="대본 글자 크게"
              className="size-10 shrink-0 rounded-md bg-white/10 font-bold text-white hover:bg-white/20 disabled:opacity-30"
            >
              가+
            </button>
          </div>
          <div
            key={slide}
            data-testid="presenter-script"
            className="min-h-0 flex-1 overflow-y-auto whitespace-pre-line break-keep px-4 py-3 text-white"
            style={{ fontSize: font.size, lineHeight: 1.65 }}
          >
            {current.script}
          </div>
        </section>

        {/* 활동·예상 답 */}
        <section
          aria-label="진행 메모"
          className="min-w-0 space-y-3 overflow-y-auto rounded-lg bg-white/[0.04] p-4 text-sm leading-6"
        >
          <Note label="참가자 활동" text={current.activity} />
          <Note label="예상 답" text={current.answer} />
          <Note label="확인 기준" text={current.success} />
          <Note label="요청문" text={current.prompt} mono />
          {!current.activity && !current.answer && !current.success && !current.prompt && (
            <p className="text-surface-500">이 장에는 따로 적은 진행 메모가 없습니다.</p>
          )}
        </section>
      </Document>

      <nav
        aria-label="장 이동"
        className="flex items-center gap-3 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={slide <= 1}
          className="min-h-14 min-w-24 rounded-lg bg-white/10 px-5 text-lg font-bold text-white hover:bg-white/20 disabled:opacity-30"
        >
          ← 이전
        </button>
        <label className="min-w-0 flex-1">
          <span className="sr-only">장 바로 가기</span>
          <select
            value={slide}
            onChange={event => {
              goTo(Number(event.target.value));
              // 방향키가 목록과 장 넘기기를 함께 움직이지 않게 고른 뒤 바로 놓는다.
              event.target.blur();
            }}
            className="min-h-14 w-full truncate rounded-lg border border-white/10 bg-surface-900 px-3 text-base text-white"
          >
            {slides.map(item => (
              <option key={item.number} value={item.number}>
                {item.number}. {item.title.replace(/\n/g, ' ')}
                {item.time ? ` · ${item.time}` : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={slide >= slideCount}
          className="min-h-14 min-w-32 rounded-lg bg-primary-600 px-6 text-lg font-bold text-white hover:bg-primary-500 disabled:opacity-30"
        >
          다음 →
        </button>
      </nav>
    </div>
  );
}

function DeckPage({
  pageNumber,
  width,
  links,
}: {
  pageNumber: number;
  width: number;
  links: boolean;
}) {
  const height = Math.round((width * 9) / 16);
  return (
    <Page
      pageNumber={pageNumber}
      width={width}
      devicePixelRatio={limitedPixelRatio(width, height)}
      renderTextLayer={false}
      renderAnnotationLayer={links}
      renderForms={false}
      className="overflow-hidden rounded-sm bg-white shadow-2xl"
      loading={<div className="bg-surface-900" style={{ width, height }} />}
    />
  );
}

/** PDF를 못 받았을 때 장 제목만 크게 보여 준다. */
function SlideFallback({ slide, small }: { slide: PresenterSlide; small?: boolean }) {
  return (
    <div className="flex size-full flex-col justify-center rounded-sm bg-surface-800 p-6">
      <p className="text-xs text-surface-400">슬라이드 그림을 불러오지 못했습니다</p>
      <p
        className={`mt-2 whitespace-pre-line break-keep font-bold text-white ${small ? 'text-base' : 'text-2xl'}`}
      >
        {slide.title}
      </p>
      {!small && slide.sub && <p className="mt-2 text-surface-300">{slide.sub}</p>}
    </div>
  );
}

function Note({ label, text, mono }: { label: string; text: string; mono?: boolean }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-xs font-bold text-surface-400">{label}</p>
      <p
        className={`mt-1 whitespace-pre-line break-keep text-surface-100 ${mono ? 'rounded bg-black/30 p-2 font-mono text-[0.8125rem] leading-6' : ''}`}
      >
        {text}
      </p>
    </div>
  );
}

/** 다음 장 대본의 첫 문장. 넘기기 전에 첫마디를 미리 떠올리게 한다. */
function firstSentence(script: string) {
  const match = script.match(/^.*?[.?!](?=\s|$)/);
  return (match ? match[0] : script).trim();
}
