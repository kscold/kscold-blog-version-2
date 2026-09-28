import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';
import { DOCUMENT_MAX_BYTES } from '../lib/adminDocuments';

export async function fetchAdminPdfBytes(id: string, signal: AbortSignal): Promise<Uint8Array> {
  // 공개 URL이나 영구 캐시 없이 권한이 보호된 원본을 현재 화면 메모리로만 받는다.
  const response = await fetch(
    `${resolveApiBaseUrl()}/admin/documents/${encodeURIComponent(id)}/download`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    }
  );
  if (response.status === 401 || response.status === 403)
    throw new Error('관리자 로그인 상태를 확인해 주세요.');
  if (response.status === 404) throw new Error('문서가 없거나 접근할 수 없습니다.');
  if (!response.ok) throw new Error('PDF를 불러오지 못했습니다. 다시 시도해 주세요.');
  const declaredSize = Number(response.headers.get('content-length'));
  if (declaredSize > DOCUMENT_MAX_BYTES) throw new Error('미리보기 용량 제한을 초과했습니다.');
  const bytes = await readBoundedPdf(response);
  if (signal.aborted) bytes.fill(0);
  signal.throwIfAborted();
  if (!new TextDecoder('ascii').decode(bytes.subarray(0, 1024)).includes('%PDF-')) {
    bytes.fill(0);
    throw new Error('올바른 PDF 파일이 아닙니다. 원본 파일을 확인해 주세요.');
  }
  return bytes;
}

async function readBoundedPdf(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('PDF 내용을 읽을 수 없습니다.');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > DOCUMENT_MAX_BYTES) throw new Error('미리보기 용량 제한을 초과했습니다.');
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes;
  } finally {
    for (const chunk of chunks) chunk.fill(0);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
