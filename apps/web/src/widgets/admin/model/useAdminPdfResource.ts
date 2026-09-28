'use client';

import { useEffect, useState } from 'react';
import { fetchAdminDocument } from '../api/adminDocumentsApi';
import { fetchAdminPdfBytes } from '../api/adminPdfApi';
import { documentErrorMessage, isPdfDocument } from '../lib/adminDocuments';
import type { AdminDocument } from './adminDocumentTypes';

interface PdfResource {
  document: AdminDocument;
  bytes: Uint8Array;
}

interface PdfResourceLoadOptions {
  id: string;
  onResource: (resource: PdfResource | null) => void;
  onError: (error: string) => void;
}

function getPdfResourceError(cause: unknown, hasTimedOut: boolean) {
  const status = (cause as { status?: number })?.status;
  if (hasTimedOut) return 'PDF 로딩이 지연되고 있습니다. 다시 시도해 주세요.';
  return status === 404 ? '문서가 없거나 접근할 수 없습니다.' : documentErrorMessage(cause);
}

function startPdfResourceLoad({ id, onResource, onError }: PdfResourceLoadOptions) {
  const controller = new AbortController();
  let bytes: Uint8Array | undefined;
  let hasTimedOut = false;
  const timeout = window.setTimeout(() => {
    hasTimedOut = true;
    controller.abort();
  }, 60_000);
  onResource(null);
  onError('');
  void (async () => {
    const document = await fetchAdminDocument(id, controller.signal);
    if (!isPdfDocument(document))
      throw new Error('PDF 파일만 바로 볼 수 있습니다. 다른 원본은 문서함에서 다운로드해 주세요.');
    bytes = await fetchAdminPdfBytes(id, controller.signal);
    if (!controller.signal.aborted) onResource({ document, bytes });
  })()
    .catch(cause => {
      if (!controller.signal.aborted || hasTimedOut)
        onError(getPdfResourceError(cause, hasTimedOut));
    })
    .finally(() => window.clearTimeout(timeout));
  return () => {
    window.clearTimeout(timeout);
    controller.abort();
    // 로그아웃·문서 변경·재시도 후에는 원본 바이트를 남기지 않는다.
    bytes?.fill(0);
  };
}

export function useAdminPdfResource(id: string) {
  const [resource, setResource] = useState<PdfResource | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(
    () => startPdfResourceLoad({ id, onResource: setResource, onError: setError }),
    [id, revision]
  );
  return { resource, error, retry: () => setRevision(value => value + 1) };
}
