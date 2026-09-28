import Button from '@/shared/ui/Button';
import {
  documentCategoryLabel,
  formatDocumentDate,
  formatDocumentSize,
} from '../../lib/adminDocuments';
import type { AdminDocument } from '../../model/adminDocumentTypes';

interface AdminDocumentCardProps {
  document: AdminDocument;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AdminDocumentCard({
  document,
  disabled,
  onEdit,
  onDelete,
}: AdminDocumentCardProps) {
  const extension = document.fileName.split('.').pop()?.slice(0, 12).toUpperCase() ?? 'FILE';
  return (
    <article
      className="min-w-0 rounded-xl border border-surface-200 bg-white p-4 sm:p-5"
      data-cy={`admin-document-${document.id}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-surface-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
          {extension}
        </span>
        <span className="rounded-full bg-surface-50 px-2.5 py-1 text-xs font-medium text-surface-600">
          {documentCategoryLabel(document.category)}
        </span>
        <span className="ml-auto text-xs text-surface-400">
          {formatDocumentSize(document.size)}
        </span>
      </div>
      <h3 className="break-words text-base font-bold leading-6 text-surface-900 [overflow-wrap:anywhere]">
        {document.title}
      </h3>
      {document.title !== document.fileName && (
        <p className="mt-1 break-all text-xs leading-5 text-surface-500">{document.fileName}</p>
      )}
      {document.description && (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-surface-600 [overflow-wrap:anywhere]">
          {document.description}
        </p>
      )}
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-5 text-surface-400">
        <div className="flex gap-1">
          <dt>등록</dt>
          <dd>{formatDocumentDate(document.createdAt)}</dd>
        </div>
        {document.updatedAt !== document.createdAt && (
          <div className="flex gap-1">
            <dt>수정</dt>
            <dd>{formatDocumentDate(document.updatedAt)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-surface-100 pt-3">
        <a
          href={`/api/admin/documents/${encodeURIComponent(document.id)}/download`}
          download={document.fileName}
          className="rounded-lg border border-surface-200 px-3 py-2 text-xs font-semibold text-surface-900 transition-colors hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-900"
          data-cy={`admin-document-download-${document.id}`}
        >
          다운로드
        </a>
        <Button
          type="button"
          variant="minimal"
          size="sm"
          disabled={disabled}
          onClick={onEdit}
          data-cy={`admin-document-edit-${document.id}`}
        >
          정보 수정
        </Button>
        <Button
          type="button"
          variant="minimal"
          size="sm"
          className="ml-auto text-red-600 hover:text-red-700"
          disabled={disabled}
          onClick={onDelete}
          data-cy={`admin-document-delete-${document.id}`}
        >
          삭제
        </Button>
      </div>
    </article>
  );
}
