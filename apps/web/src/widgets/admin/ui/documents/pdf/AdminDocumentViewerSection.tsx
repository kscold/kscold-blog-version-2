'use client';

import { useAdminPdfSession } from '../../../model/useAdminPdfSession';
import { AdminDocumentAccessGate } from '../AdminDocumentAccessGate';
import { AdminDocumentPdfWorkspace } from './AdminDocumentPdfWorkspace';
import { PdfViewerStatus } from './PdfViewerStatus';

function VerifiedPdfViewer({ id }: { id: string }) {
  const { isActive, error, retrySession } = useAdminPdfSession();
  if (!isActive) return <PdfViewerStatus error={error} onRetry={retrySession} />;
  return <AdminDocumentPdfWorkspace id={id} />;
}

export function AdminDocumentViewerSection({ id }: { id: string }) {
  return (
    <AdminDocumentAccessGate redirect={`/admin/documents/${encodeURIComponent(id)}/view`}>
      <VerifiedPdfViewer key={id} id={id} />
    </AdminDocumentAccessGate>
  );
}
