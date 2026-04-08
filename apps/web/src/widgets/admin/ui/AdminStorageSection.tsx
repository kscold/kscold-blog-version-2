'use client';

import { ChangeEvent, DragEvent, FormEvent, useState } from 'react';
import { storageBreadcrumbs } from '@/widgets/admin/lib/adminStorage';
import { useAdminStorage } from '@/widgets/admin/lib/useAdminStorage';
import { AdminStorageBrowser } from './storage/AdminStorageBrowser';
import { AdminStorageFolderPanel } from './storage/AdminStorageFolderPanel';
import { AdminStorageGuidePanel } from './storage/AdminStorageGuidePanel';
import { AdminStorageHeader } from './storage/AdminStorageHeader';
import { AdminStorageOverview } from './storage/AdminStorageOverview';
import { AdminStoragePreviewPanel } from './storage/AdminStoragePreviewPanel';
import { AdminStorageUploadPanel } from './storage/AdminStorageUploadPanel';

export function AdminStorageSection() {
  const {
    listing,
    isLoading,
    isMutating,
    activeAction,
    errorMessage,
    selectedObject,
    currentPrefix,
    navigateTo,
    refresh,
    createFolder,
    uploadFiles,
    deleteEntry,
    selectObject,
  } = useAdminStorage();
  const [folderName, setFolderName] = useState('');
  const [selectedFilesLabel, setSelectedFilesLabel] = useState('선택된 파일이 없습니다.');

  async function handleFolderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFolderName = folderName.trim();
    if (!nextFolderName) return;
    await createFolder(nextFolderName);
    setFolderName('');
  }

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setSelectedFilesLabel('선택된 파일이 없습니다.');
      return;
    }

    setSelectedFilesLabel(files.map(file => file.name).join(', '));
    await uploadFiles(files);
    event.target.value = '';
    setSelectedFilesLabel('선택된 파일이 없습니다.');
  }

  async function handleFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) {
      setSelectedFilesLabel('선택된 파일이 없습니다.');
      return;
    }

    setSelectedFilesLabel(files.map(file => file.name).join(', '));
    await uploadFiles(files);
    setSelectedFilesLabel('선택된 파일이 없습니다.');
  }

  const breadcrumbs = storageBreadcrumbs(currentPrefix);
  const objectCount = listing?.objects.length || 0;
  const folderCount = listing?.folders.length || 0;
  const selectedObjectKey = selectedObject?.key || null;
  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFilesChange(event);
  };

  return (
    <div data-cy="admin-storage-page" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminStorageHeader
        bucket={listing?.bucket}
        disabled={isLoading || isMutating}
        onRefresh={() => void refresh()}
      />
      <AdminStorageOverview
        breadcrumbs={breadcrumbs}
        currentPrefix={currentPrefix}
        folderCount={folderCount}
        objectCount={objectCount}
        errorMessage={errorMessage}
        onNavigate={navigateTo}
      />

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminStorageBrowser
          listing={listing}
          currentPrefix={currentPrefix}
          selectedObjectKey={selectedObjectKey}
          isLoading={isLoading}
          isMutating={isMutating}
          onNavigate={navigateTo}
          onDeleteEntry={deleteEntry}
          onSelectObject={selectObject}
        />

        <div className="space-y-4">
          <AdminStorageUploadPanel
            currentPrefix={currentPrefix}
            selectedFilesLabel={selectedFilesLabel}
            isMutating={isMutating}
            isUploading={isMutating && activeAction === 'upload'}
            onFileSelection={handleFileSelection}
            onFileDrop={handleFileDrop}
          />
          <AdminStorageFolderPanel
            folderName={folderName}
            isMutating={isMutating}
            isCreatingFolder={isMutating && activeAction === 'folder'}
            onFolderNameChange={setFolderName}
            onSubmit={handleFolderSubmit}
          />
          <AdminStoragePreviewPanel selectedObject={selectedObject} />
        </div>
      </section>

      <AdminStorageGuidePanel />
    </div>
  );
}
