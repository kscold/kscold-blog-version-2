'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import { usePdfReaderState } from '../../../model/usePdfReaderState';
import { PdfReaderContent } from './PdfReaderContent';
import { PdfReaderFooter } from './PdfReaderFooter';
import { PdfViewerToolbar } from './PdfViewerToolbar';

interface PdfDocumentReaderProps {
  bytes: Uint8Array;
  onRetry: () => void;
}

export default function PdfDocumentReader({ bytes, onRetry }: PdfDocumentReaderProps) {
  const state = usePdfReaderState(bytes);
  return (
    <>
      <PdfViewerToolbar
        pageCount={state.navigation.pageCount}
        pageNumber={state.navigation.pageNumber}
        scale={state.scale}
        onPage={state.navigation.goToPage}
        onScale={state.setScale}
        onRotate={state.rotate}
      />
      <PdfReaderContent state={state} onRetry={onRetry} />
      <PdfReaderFooter
        pageCount={state.navigation.pageCount}
        pageNumber={state.navigation.pageNumber}
      />
    </>
  );
}
