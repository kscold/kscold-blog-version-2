'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadAdminDocument } from '../api/adminDocumentsApi';
import { documentErrorMessage, validateDocumentFile } from '../lib/adminDocuments';
import type { AdminDocumentCategory, DocumentUploadItem } from './adminDocumentTypes';

interface StartUploadOptions {
  category: AdminDocumentCategory;
  description: string;
}

export function useAdminDocumentUploads(
  onStored: () => void,
  fixedCategory?: AdminDocumentCategory
) {
  const [items, setItems] = useState<DocumentUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const locked = useRef(false);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function selectFiles(files: File[]) {
    if (locked.current) return;
    setItems(
      files.map(file => {
        const error = validateDocumentFile(file);
        return {
          id: crypto.randomUUID(),
          file,
          status: error ? 'error' : 'queued',
          progress: 0,
          error,
        };
      })
    );
  }

  function updateItem(id: string, patch: Partial<DocumentUploadItem>) {
    setItems(current => current.map(item => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadItem(
    item: DocumentUploadItem,
    options: StartUploadOptions,
    signal: AbortSignal
  ) {
    updateItem(item.id, { status: 'uploading', progress: 0, error: undefined });
    try {
      await uploadAdminDocument({
        file: item.file,
        ...options,
        signal,
        onProgress: progress => {
          if (!signal.aborted) updateItem(item.id, { progress });
        },
      });
      if (signal.aborted) return false;
      updateItem(item.id, { status: 'success', progress: 100 });
      return true;
    } catch (cause) {
      if (!signal.aborted)
        updateItem(item.id, { status: 'error', error: documentErrorMessage(cause) });
      return false;
    }
  }

  async function startUpload(options: StartUploadOptions) {
    const pendingItems = items.filter(item => item.status === 'queued');
    if (locked.current || !pendingItems.length) return;
    locked.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsUploading(true);
    try {
      for (const item of pendingItems) {
        if (controller.signal.aborted) break;
        await uploadItem(
          item,
          { ...options, category: fixedCategory ?? options.category },
          controller.signal
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsUploading(false);
        // 연결 오류여도 서버에서 저장됐을 수 있으므로 목록을 다시 확인한다.
        onStored();
      }
      locked.current = false;
    }
  }

  const clearFiles = () => {
    if (!locked.current) setItems([]);
  };
  return { items, isUploading, selectFiles, startUpload, clearFiles };
}
