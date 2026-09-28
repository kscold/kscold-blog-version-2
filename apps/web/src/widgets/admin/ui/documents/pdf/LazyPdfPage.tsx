'use client';

import type { RefObject } from 'react';
import { Page } from 'react-pdf';
import { useLazyPdfPage, type LazyPdfPageState } from '../../../model/useLazyPdfPage';

interface LazyPageProps {
  pageNumber: number;
  width: number;
  rotation: number;
  scrollRef: RefObject<HTMLDivElement | null>;
}

interface PdfPageCanvasProps extends LazyPageProps {
  state: LazyPdfPageState;
}

function PdfPageCanvas({ pageNumber, width, rotation, state }: PdfPageCanvasProps) {
  return (
    <Page
      pageNumber={pageNumber}
      width={width}
      rotate={(state.intrinsicRotation + rotation) % 360}
      devicePixelRatio={state.pixelRatio}
      onLoadSuccess={state.onLoad}
      renderAnnotationLayer={false}
      renderForms={false}
      onRenderError={state.onError}
      onLoadError={state.onError}
      loading={
        <p className="p-6 text-center text-xs text-surface-400">{pageNumber}페이지 로딩 중</p>
      }
      error={
        <p className="p-6 text-center text-sm text-surface-600">이 페이지를 표시할 수 없습니다.</p>
      }
    />
  );
}

export function LazyPdfPage(props: LazyPageProps) {
  const { pageNumber, width } = props;
  const state = useLazyPdfPage(props);
  return (
    <div
      ref={state.pageRef}
      data-cy={`pdf-page-${pageNumber}`}
      data-pdf-page={pageNumber}
      className="relative shrink-0 overflow-hidden bg-white shadow-sm"
      style={{ width, minHeight: state.height }}
      aria-label={`${pageNumber}페이지`}
    >
      {state.isNear ? (
        <PdfPageCanvas {...props} state={state} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-surface-400">
          {pageNumber}페이지
        </span>
      )}
      {state.hasError && (
        <p role="alert" className="p-4 text-sm text-surface-600">
          이 페이지를 표시하지 못했습니다. 원본 PDF를 확인해 주세요.
        </p>
      )}
    </div>
  );
}
