'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  PDF_DOCUMENT_OPTIONS,
  configurePdfWorker,
  limitedPixelRatio,
} from '@/shared/lib/pdf/pdfjsOptions';
import {
  useFullscreen,
  useSlideKeys,
  useSlideNavigation,
  useStageFit,
  useSwipe,
} from '../../model/useSlideShow';
import { SlideShowControls } from './SlideShowControls';

configurePdfWorker();

interface SlideShowProps {
  file: string;
  title: string;
  backHref: string;
}

export default function SlideShow({ file, title, backHref }: SlideShowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [error, setError] = useState(false);
  const navigation = useSlideNavigation();
  const { slide, slideCount, goTo } = navigation;
  const fullscreen = useFullscreen(rootRef);
  const fit = useStageFit(stageRef, aspectRatio);

  useSlideKeys({ goTo, slide, slideCount, toggleFullscreen: fullscreen.toggle });
  useSwipe(
    stageRef,
    useCallback(direction => goTo(slide + direction), [goTo, slide])
  );

  const onLoad = (pdf: PDFDocumentProxy) => {
    navigation.onLoaded(pdf.numPages);
    void pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      setAspectRatio(viewport.width / viewport.height);
    });
  };

  // 화면 왼쪽 1/3을 누르면 앞으로, 나머지를 누르면 다음 장으로 간다.
  const onStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    goTo(event.clientX - left < width / 3 ? slide - 1 : slide + 1);
  };

  const pixelRatio = fit.width ? limitedPixelRatio(fit.width, fit.height) : 1;

  return (
    <div
      ref={rootRef}
      data-testid="slideshow"
      className="flex h-[100dvh] flex-col bg-surface-950 text-white"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <Link href={backHref} className="shrink-0 font-bold text-surface-300 hover:text-white">
          ← 자료 페이지
        </Link>
        <p className="truncate text-center font-bold text-surface-300">{title}</p>
        <span className="shrink-0 font-mono text-xs text-surface-400" aria-live="polite">
          {slideCount ? `${slide} / ${slideCount}` : ''}
        </span>
      </header>

      <div
        ref={stageRef}
        onClick={onStageClick}
        className="relative flex min-h-0 flex-1 cursor-pointer select-none items-center justify-center px-2 sm:px-6"
        role="region"
        aria-label={`슬라이드 ${slide}`}
      >
        {error ? (
          <p role="alert" className="text-sm text-surface-300">
            슬라이드를 불러오지 못했습니다. 자료 페이지에서 PDF를 내려받아 주세요.
          </p>
        ) : (
          <Document
            file={file}
            options={PDF_DOCUMENT_OPTIONS}
            onLoadSuccess={onLoad}
            onLoadError={() => setError(true)}
            onSourceError={() => setError(true)}
            loading={<p className="text-sm text-surface-400">슬라이드를 불러오는 중입니다…</p>}
            error={null}
          >
            {fit.width > 0 && slideCount > 0 && (
              <div className="relative" style={{ width: fit.width, height: fit.height }}>
                {/* 앞뒤 장을 같은 목록에 미리 그려 두어, 넘길 때 빈 화면 없이 바로 바뀌게 한다. */}
                {[slide - 1, slide, slide + 1]
                  .filter(page => page >= 1 && page <= slideCount)
                  .map(page => (
                    <div
                      key={page}
                      data-testid={page === slide ? 'slideshow-current' : undefined}
                      data-slide={page}
                      aria-hidden={page !== slide}
                      className={`absolute inset-0 ${page === slide ? '' : 'pointer-events-none opacity-0'}`}
                    >
                      <SlidePage pageNumber={page} width={fit.width} pixelRatio={pixelRatio} />
                    </div>
                  ))}
              </div>
            )}
          </Document>
        )}
      </div>

      <SlideShowControls
        slide={slide}
        slideCount={slideCount}
        goTo={goTo}
        isFullscreen={fullscreen.isFullscreen}
        canFullscreen={fullscreen.isSupported}
        onToggleFullscreen={fullscreen.toggle}
        downloadHref={file}
      />
    </div>
  );
}

function SlidePage({
  pageNumber,
  width,
  pixelRatio,
}: {
  pageNumber: number;
  width: number;
  pixelRatio: number;
}) {
  return (
    <Page
      pageNumber={pageNumber}
      width={width}
      devicePixelRatio={pixelRatio}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      renderForms={false}
      className="overflow-hidden rounded-sm bg-white shadow-2xl"
      loading={<div className="bg-surface-900" style={{ width, height: '100%' }} />}
    />
  );
}
