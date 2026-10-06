import { formatDocumentSize } from '../../lib/adminDocuments';
import type { DocumentUploadItem } from '../../model/adminDocumentTypes';

interface DocumentUploadResultsProps {
  items: DocumentUploadItem[];
  isUploading: boolean;
}

function uploadStatusLabel(item: DocumentUploadItem) {
  if (item.status === 'success') return '업로드 완료';
  if (item.status === 'error') return '실패';
  if (item.status === 'uploading')
    return item.progress >= 99 ? '저장 중' : `업로드 중 ${item.progress}%`;
  return '대기';
}

export function DocumentUploadResults({ items, isUploading }: DocumentUploadResultsProps) {
  if (!items.length) return null;
  const successes = items.filter(item => item.status === 'success').length;
  const errors = items.filter(item => item.status === 'error').length;
  return (
    <div className="space-y-3" data-testid="admin-documents-upload-results">
      <p role="status" aria-live="polite" className="text-xs font-medium text-surface-600">
        선택 {items.length}개 · 완료 {successes}개 · 실패 {errors}개
        {isUploading ? ' · 순서대로 업로드 중' : ''}
      </p>
      <ul className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-surface-200 bg-surface-50 p-3">
        {items.map(item => (
          <li
            key={item.id}
            className="min-w-0 space-y-1.5 rounded-lg bg-white p-3"
            data-testid="admin-document-upload-result"
          >
            <p className="break-all text-sm font-medium text-surface-900">{item.file.name}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-surface-500">
              <span>{formatDocumentSize(item.file.size)}</span>
              <span className={item.status === 'error' ? 'text-red-600' : 'text-surface-700'}>
                {uploadStatusLabel(item)}
              </span>
            </div>
            {item.status === 'uploading' && (
              <progress
                aria-label={`${item.file.name} 업로드 진행률`}
                value={item.progress}
                max={100}
                className="h-1.5 w-full accent-surface-900"
              />
            )}
            {item.error && (
              <p className="break-words text-xs leading-5 text-red-600">{item.error}</p>
            )}
          </li>
        ))}
      </ul>
      {!isUploading && errors > 0 && (
        <p className="text-xs leading-5 text-surface-500">
          완료한 파일은 다시 올리지 않아도 됩니다. 실패한 파일만 다시 선택해 주세요. 연결 오류였다면
          먼저 목록을 새로고침해 저장 여부를 확인해 주세요.
        </p>
      )}
    </div>
  );
}
