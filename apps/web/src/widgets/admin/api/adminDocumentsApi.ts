import { apiClient } from '@/shared/api/api-client';
import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';
import type { User } from '@/shared/model/types/user';
import { DOCUMENT_PAGE_SIZE } from '../lib/adminDocuments';
import type {
  AdminDocument,
  AdminDocumentDetails,
  AdminDocumentFilter,
  AdminDocumentPage,
} from '../model/adminDocumentTypes';

export function fetchAdminDocuments(filter: AdminDocumentFilter, signal: AbortSignal) {
  const params = new URLSearchParams({
    query: filter.query,
    page: String(filter.page),
    size: String(DOCUMENT_PAGE_SIZE),
  });
  if (filter.category) params.set('category', filter.category);
  return apiClient.get<AdminDocumentPage>(`/admin/documents?${params}`, { signal });
}

interface UploadDocumentOptions {
  file: File;
  category: AdminDocumentDetails['category'];
  description: string;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export function uploadAdminDocument(options: UploadDocumentOptions) {
  const formData = new FormData();
  formData.append('file', options.file);
  formData.append('category', options.category);
  formData.append('description', options.description);
  return apiClient.upload<AdminDocument>('/admin/documents', formData, {
    signal: options.signal,
    timeout: 120_000,
    onUploadProgress: event => {
      if (event.total)
        options.onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    },
  });
}

export function updateAdminDocument(
  id: string,
  details: AdminDocumentDetails,
  signal: AbortSignal
) {
  return apiClient.put<AdminDocument>(`/admin/documents/${encodeURIComponent(id)}`, details, {
    signal,
  });
}

export function deleteAdminDocument(id: string, signal: AbortSignal) {
  return apiClient.delete<null>(`/admin/documents/${encodeURIComponent(id)}`, { signal });
}

export async function verifyAdminDocumentSession(signal: AbortSignal): Promise<User> {
  // 세션 진단 실패를 자동 새로고침·로그인 리다이렉트로 이어 붙이지 않는다.
  const response = await fetch(`${resolveApiBaseUrl()}/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
    signal,
  });
  if (!response.ok)
    throw new Error('관리자 로그인 상태를 확인하지 못했습니다. 다시 확인하거나 로그인해 주세요.');
  const payload = (await response.json()) as { success?: boolean; data?: User };
  if (payload.success === false || !payload.data?.id || payload.data.role !== 'ADMIN') {
    throw new Error('이 계정에는 관리자 권한이 없습니다. 관리자 계정으로 로그인해 주세요.');
  }
  return payload.data;
}
