'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useAdminPdfResource } from '../../../model/useAdminPdfResource';
import { PdfViewerHeader } from './PdfViewerHeader';
import { PdfViewerStatus } from './PdfViewerStatus';

const PdfDocumentReader = dynamic(() => import('./PdfDocumentReader'), {
  ssr: false,
  loading: () => <PdfViewerStatus />,
});

export function AdminDocumentPdfWorkspace({ id }: { id: string }) {
  const { resource, error, retry } = useAdminPdfResource(id);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <section
      className="fixed inset-0 z-[100] flex h-dvh min-w-0 flex-col bg-surface-100"
      aria-label="비공개 PDF 뷰어"
      data-testid="admin-document-viewer"
    >
      <PdfViewerHeader document={resource?.document} />
      {resource ? (
        <PdfDocumentReader bytes={resource.bytes} onRetry={retry} />
      ) : (
        <PdfViewerStatus error={error} onRetry={retry} />
      )}
    </section>
  );
}
