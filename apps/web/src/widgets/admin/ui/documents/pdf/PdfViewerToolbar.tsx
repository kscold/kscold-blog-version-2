import Button from '@/shared/ui/Button';
import { clampPdfScale } from '../../../model/usePdfPinchZoom';
import { PdfViewerPagination } from './PdfViewerPagination';

interface ToolbarProps {
  pageCount: number;
  pageNumber: number;
  scale: number;
  onPage: (page: number) => void;
  onScale: (scale: number) => void;
  onRotate: () => void;
}

interface PdfZoomControlProps {
  isDisabled: boolean;
  scale: number;
  onScale: (scale: number) => void;
}

interface PdfPageViewControlProps {
  isDisabled: boolean;
  onScale: (scale: number) => void;
  onRotate: () => void;
}

const CONTROL_CLASS = 'min-h-11 min-w-11 px-2';

function PdfZoomControls({ isDisabled, scale, onScale }: PdfZoomControlProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={CONTROL_CLASS}
        aria-label="PDF 축소"
        data-testid="pdf-viewer-zoom-out"
        disabled={isDisabled || scale <= 0.5}
        onClick={() => onScale(clampPdfScale(scale - 0.25))}
      >
        −
      </Button>
      <span className="w-10 text-center tabular-nums text-surface-600" aria-live="polite">
        {Math.round(scale * 100)}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={CONTROL_CLASS}
        aria-label="PDF 확대"
        data-testid="pdf-viewer-zoom-in"
        disabled={isDisabled || scale >= 2.5}
        onClick={() => onScale(clampPdfScale(scale + 0.25))}
      >
        +
      </Button>
    </>
  );
}

function PdfPageViewControls({ isDisabled, onScale, onRotate }: PdfPageViewControlProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={CONTROL_CLASS}
        disabled={isDisabled}
        onClick={() => onScale(1)}
        data-testid="pdf-viewer-fit"
      >
        화면 맞춤
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={CONTROL_CLASS}
        aria-label="PDF 90도 회전"
        disabled={isDisabled}
        onClick={onRotate}
        data-testid="pdf-viewer-rotate"
      >
        회전
      </Button>
    </>
  );
}

export function PdfViewerToolbar(props: ToolbarProps) {
  const isDisabled = !props.pageCount;
  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-surface-200 bg-white px-2 py-2 sm:px-6"
      aria-label="PDF 보기 도구"
    >
      <PdfViewerPagination
        pageCount={props.pageCount}
        pageNumber={props.pageNumber}
        onPage={props.onPage}
      />
      <div className="flex flex-wrap items-center gap-1 text-xs sm:gap-2">
        <PdfZoomControls isDisabled={isDisabled} scale={props.scale} onScale={props.onScale} />
        <PdfPageViewControls
          isDisabled={isDisabled}
          onScale={props.onScale}
          onRotate={props.onRotate}
        />
      </div>
    </div>
  );
}
