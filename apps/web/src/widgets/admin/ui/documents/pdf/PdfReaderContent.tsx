import type { PdfReaderState } from '../../../model/usePdfReaderState';
import { PdfDocumentPages } from './PdfDocumentPages';
import { PdfPasswordForm } from './PdfPasswordForm';
import { PdfViewerStatus } from './PdfViewerStatus';

interface PdfReaderContentProps {
  state: PdfReaderState;
  onRetry: () => void;
}

export function PdfReaderContent({ state, onRetry }: PdfReaderContentProps) {
  const { document, fitWidth, pageWidth } = state;
  return (
    <div
      ref={state.scrollRef}
      onScroll={state.navigation.onScroll}
      tabIndex={0}
      aria-label="PDF 본문"
      data-testid="pdf-viewer-scroll"
      data-scale={state.scale}
      data-rotation={state.rotation}
      className="relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain focus:outline-none"
      style={{ touchAction: 'pan-x pan-y' }}
    >
      {document.passwordRequest && (
        <div className="p-4 sm:p-10">
          <PdfPasswordForm
            key={document.passwordRequest.isIncorrect ? 'incorrect' : 'required'}
            request={document.passwordRequest}
          />
        </div>
      )}
      {document.error && <PdfViewerStatus error={document.error} onRetry={onRetry} />}
      <div className="mx-auto" style={{ width: Math.max(pageWidth + 32, fitWidth + 32) }}>
        <PdfDocumentPages state={state} />
      </div>
    </div>
  );
}
