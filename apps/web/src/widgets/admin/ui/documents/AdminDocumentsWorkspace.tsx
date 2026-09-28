'use client';

import { useState } from 'react';
import { useAdminDocuments } from '../../model/useAdminDocuments';
import { useAdminDocumentUploads } from '../../model/useAdminDocumentUploads';
import type {
  AdminDocument,
  AdminDocumentFilter,
  AdminDocumentSpaceDetails,
} from '../../model/adminDocumentTypes';
import { AdminDocumentEditForm } from './AdminDocumentEditForm';
import { AdminDocumentsFilter } from './AdminDocumentsFilter';
import { AdminDocumentsHeader } from './AdminDocumentsHeader';
import { AdminDocumentsList } from './AdminDocumentsList';
import { AdminDocumentsUploadPanel } from './AdminDocumentsUploadPanel';

export function AdminDocumentsWorkspace({ space }: { space: AdminDocumentSpaceDetails }) {
  const documents = useAdminDocuments(space.fixedCategory);
  const uploads = useAdminDocumentUploads(documents.refresh, space.fixedCategory);
  const [editingDocument, setEditingDocument] = useState<AdminDocument | null>(null);
  const isBusy = documents.isMutating || uploads.isUploading;
  function applyFilter(filter: Pick<AdminDocumentFilter, 'category' | 'query'>) {
    setEditingDocument(null);
    documents.changeFilter(filter);
  }
  function changePage(page: number) {
    if (isBusy) return;
    setEditingDocument(null);
    documents.changePage(page);
  }
  return (
    <div
      data-cy="admin-documents-page"
      className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <AdminDocumentsHeader
        space={space}
        disabled={documents.isLoading || isBusy}
        onRefresh={documents.refresh}
      />
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section
          aria-labelledby="document-list-heading"
          className="min-w-0 rounded-2xl border border-surface-200 bg-white p-5 sm:p-6"
        >
          <h2 id="document-list-heading" className="mb-5 text-lg font-bold text-surface-900">
            {space.listHeading}
          </h2>
          <AdminDocumentsFilter
            filter={documents.filter}
            disabled={isBusy}
            fixedCategory={space.fixedCategory}
            onApply={applyFilter}
          />
          {editingDocument && (
            <AdminDocumentEditForm
              key={editingDocument.id}
              document={editingDocument}
              isSaving={documents.isMutating}
              onClose={() => setEditingDocument(null)}
              onSave={details => documents.saveDocument(editingDocument, details)}
            />
          )}
          <AdminDocumentsList
            listing={documents.listing}
            page={documents.filter.page}
            isLoading={documents.isLoading}
            disabled={isBusy}
            error={documents.error}
            notice={documents.notice}
            hasFilter={!!(
              documents.filter.query || (!space.fixedCategory && documents.filter.category)
            )}
            emptyDescription={space.uploadGuide}
            isCategoryLocked={!!space.fixedCategory}
            onRefresh={documents.refresh}
            onEdit={setEditingDocument}
            onDelete={document => {
              void documents.removeDocument(document).then(deleted => {
                if (deleted && editingDocument?.id === document.id) setEditingDocument(null);
              });
            }}
            onPageChange={changePage}
          />
        </section>
        <AdminDocumentsUploadPanel
          space={space}
          items={uploads.items}
          isUploading={uploads.isUploading}
          disabled={documents.isMutating}
          onFiles={uploads.selectFiles}
          onUpload={uploads.startUpload}
          onClear={uploads.clearFiles}
        />
      </div>
    </div>
  );
}
