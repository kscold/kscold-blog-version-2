import Button from '@/shared/ui/Button';
import Link from 'next/link';

export function PdfViewerStatus({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center"
      role={error ? 'alert' : 'status'}
      data-cy={error ? 'pdf-viewer-error' : 'pdf-viewer-loading'}
    >
      {!error && (
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-surface-200 border-t-surface-900"
          aria-hidden
        />
      )}
      <p className="max-w-md text-sm leading-6 text-surface-600">
        {error || '비공개 PDF를 준비하고 있습니다.'}
      </p>
      {error && onRetry && (
        <Button onClick={onRetry} size="sm" data-cy="pdf-viewer-retry">
          다시 시도
        </Button>
      )}
      {error && (
        <Link
          href="/admin/documents"
          prefetch={false}
          className="text-sm font-semibold text-surface-900 underline underline-offset-4"
        >
          개인 문서함으로 돌아가기
        </Link>
      )}
    </div>
  );
}
