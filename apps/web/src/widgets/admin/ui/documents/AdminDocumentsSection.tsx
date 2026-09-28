'use client';

import { AdminDocumentAccessGate } from './AdminDocumentAccessGate';
import { AdminDocumentsWorkspace } from './AdminDocumentsWorkspace';
import { DOCUMENT_SPACES } from '../../lib/adminDocumentSpaces';
import type { AdminDocumentSpace } from '../../model/adminDocumentTypes';

export function AdminDocumentsSection({ space = 'all' }: { space?: AdminDocumentSpace }) {
  const details = DOCUMENT_SPACES[space];
  return (
    <AdminDocumentAccessGate redirect={details.href}>
      <AdminDocumentsWorkspace key={space} space={details} />
    </AdminDocumentAccessGate>
  );
}
