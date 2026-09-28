import type { AdminDocument, AdminDocumentCategory } from '../model/adminDocumentTypes';

export const DOCUMENT_CATEGORIES: { value: AdminDocumentCategory; label: string }[] = [
  { value: 'RESUME', label: '이력서' },
  { value: 'CAREER', label: '경력 소스' },
  { value: 'STORY', label: '스토리' },
  { value: 'PERSONAL', label: '개인 자료' },
  { value: 'OTHER', label: '기타' },
];

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_PAGE_SIZE = 12;
export function isPdfDocument(document: AdminDocument): boolean {
  return document.fileName.toLowerCase().endsWith('.pdf');
}
export const DOCUMENT_ACCEPT =
  '.pdf,.md,.txt,.html,.htm,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json,.zip,.7z,.png,.jpg,.jpeg,.webp,.gif,.svg,.hwp,.hwpx';

export function documentCategoryLabel(category: AdminDocumentCategory): string {
  return DOCUMENT_CATEGORIES.find(item => item.value === category)?.label ?? '기타';
}

export function formatDocumentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function validateDocumentFile(file: File): string | undefined {
  if (!file.size) return '내용이 없는 파일은 업로드할 수 없습니다.';
  if (file.size > DOCUMENT_MAX_BYTES) return '파일 하나당 최대 10 MB까지 업로드할 수 있습니다.';
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!DOCUMENT_ACCEPT.split(',').includes(extension)) return '지원하지 않는 파일 형식입니다.';
  return undefined;
}

export function documentErrorMessage(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;
  if (status === 413) return '파일이 업로드 용량 제한을 초과했습니다.';
  if (status === 401 || status === 403) return '관리자 로그인 상태를 확인해 주세요.';
  return error instanceof Error ? error.message : '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
}
