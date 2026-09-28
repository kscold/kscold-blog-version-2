import type { AdminDocument } from '../../../model/adminDocumentTypes';
import { documentCategoryLabel, formatDocumentSize } from '../../../lib/adminDocuments';
import { documentSpaceForCategory } from '../../../lib/adminDocumentSpaces';

export function PdfViewerHeader({ document }: { document?: AdminDocument }) {
  const space = documentSpaceForCategory(document?.category);
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-surface-200 bg-white px-3 py-3 sm:px-6">
      <a
        href={space.href}
        aria-label={`${space.title}로 돌아가기`}
        data-cy="pdf-viewer-back"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-surface-200 text-xl text-surface-700 hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-900"
      >
        ←
      </a>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-bold text-surface-900 sm:text-base">
          {document?.title || 'PDF 바로 보기'}
        </h1>
        <p className="mt-1 truncate text-xs text-surface-500">
          비공개
          {document
            ? ` · ${documentCategoryLabel(document.category)} · ${formatDocumentSize(document.size)}`
            : ' · 관리자 전용'}
        </p>
      </div>
      {document && (
        <a
          href={`/api/admin/documents/${encodeURIComponent(document.id)}/download`}
          download={document.fileName}
          data-cy="pdf-viewer-download"
          className="flex min-h-11 shrink-0 items-center rounded-xl bg-surface-900 px-3 text-xs font-semibold text-white hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2"
        >
          다운로드
        </a>
      )}
    </header>
  );
}
