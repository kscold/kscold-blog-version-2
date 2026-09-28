'use client';

import { Document, pdfjs } from 'react-pdf';
import type { PdfReaderState } from '../../../model/usePdfReaderState';
import { LazyPdfPage } from './LazyPdfPage';
import { PdfViewerStatus } from './PdfViewerStatus';

// 워커와 폰트 등 모든 런타임 자산은 외부 CDN이 아닌 같은 사이트에서 받는다.
const ASSET_BASE = `/pdfjs/${pdfjs.version}`;
pdfjs.GlobalWorkerOptions.workerSrc = `${ASSET_BASE}/pdf.worker.min.mjs`;
const PDF_OPTIONS = {
  cMapUrl: `${ASSET_BASE}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${ASSET_BASE}/standard_fonts/`,
  wasmUrl: `${ASSET_BASE}/wasm/`,
  iccUrl: `${ASSET_BASE}/iccs/`,
  isEvalSupported: false,
  enableXfa: false,
  maxImageSize: 16_000_000,
  canvasMaxAreaInBytes: 16_000_000,
  verbosity: 0,
};

export function PdfDocumentPages({ state }: { state: PdfReaderState }) {
  const { document } = state;
  return (
    <Document
      file={document.file}
      options={PDF_OPTIONS}
      suspense={false}
      onLoadSuccess={document.onLoad}
      onPassword={document.onPassword}
      onLoadError={document.reportLoadError}
      onSourceError={document.reportSourceError}
      loading={document.passwordRequest ? null : <PdfViewerStatus />}
      error={null}
      className={`mx-auto flex flex-col items-center gap-4 p-4 ${document.error || document.passwordRequest ? 'hidden' : ''}`}
    >
      {Array.from({ length: state.navigation.pageCount }, (_, index) => (
        <LazyPdfPage
          key={index + 1}
          pageNumber={index + 1}
          width={state.pageWidth}
          rotation={state.rotation}
          scrollRef={state.scrollRef}
        />
      ))}
    </Document>
  );
}
