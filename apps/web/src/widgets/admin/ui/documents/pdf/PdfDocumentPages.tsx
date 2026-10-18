'use client';

import { Document } from 'react-pdf';
import { PDF_DOCUMENT_OPTIONS, configurePdfWorker } from '@/shared/lib/pdf/pdfjsOptions';
import type { PdfReaderState } from '../../../model/usePdfReaderState';
import { LazyPdfPage } from './LazyPdfPage';
import { PdfViewerStatus } from './PdfViewerStatus';

configurePdfWorker();

export function PdfDocumentPages({ state }: { state: PdfReaderState }) {
  const { document } = state;
  return (
    <Document
      file={document.file}
      options={PDF_DOCUMENT_OPTIONS}
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
