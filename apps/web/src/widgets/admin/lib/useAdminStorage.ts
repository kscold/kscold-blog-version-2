'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/shared/api/api-client';
import { useAlert } from '@/shared/model/alertStore';
import type { AdminStorageListing } from './adminStorage';

type StorageAction = 'upload' | 'folder' | 'delete';

function normalizePrefix(value: string | null) {
  if (!value) return '';
  const trimmed = value.replace(/^\/+|\/+$/g, '');
  return trimmed ? `${trimmed}/` : '';
}

export function useAdminStorage() {
  const alerts = useAlert();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [listing, setListing] = useState<AdminStorageListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [activeAction, setActiveAction] = useState<StorageAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedObjectKey, setSelectedObjectKey] = useState<string | null>(null);
  const latestPrefixRef = useRef('');

  const currentPrefix = useMemo(
    () => normalizePrefix(searchParams.get('prefix')),
    [searchParams]
  );

  const applyListing = useCallback((data: AdminStorageListing) => {
    latestPrefixRef.current = data.currentPrefix;
    setListing(data);
    setErrorMessage(null);
    setSelectedObjectKey(previous =>
      data.objects.some(item => item.key === previous) ? previous : data.objects[0]?.key || null
    );
  }, []);

  const loadListing = useCallback(
    async (prefix = currentPrefix, showLoader = false) => {
      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const data = await apiClient.get<AdminStorageListing>(
          `/admin/storage?prefix=${encodeURIComponent(prefix)}`
        );
        applyListing(data);
      } catch (error) {
        setListing(null);
        setErrorMessage(
          error instanceof Error ? error.message : '저장소 목록을 불러오지 못했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [applyListing, currentPrefix]
  );

  useEffect(() => {
    void loadListing(currentPrefix, true);
  }, [currentPrefix, loadListing]);

  function navigateTo(prefix: string) {
    const params = new URLSearchParams(searchParams.toString());
    const nextPrefix = normalizePrefix(prefix);

    if (nextPrefix) {
      params.set('prefix', nextPrefix);
    } else {
      params.delete('prefix');
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }

  async function createFolder(folderName: string) {
    setIsMutating(true);
    setActiveAction('folder');

    try {
      const data = await apiClient.post<AdminStorageListing>('/admin/storage/folders', {
        prefix: latestPrefixRef.current,
        folderName,
      });
      applyListing(data);
      alerts.success('폴더를 만들었습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '폴더를 만들지 못했습니다.';
      setErrorMessage(message);
      alerts.error(message);
    } finally {
      setIsMutating(false);
      setActiveAction(null);
    }
  }

  async function uploadFiles(files: File[]) {
    setIsMutating(true);
    setActiveAction('upload');

    try {
      const formData = new FormData();
      formData.set('prefix', latestPrefixRef.current);
      for (const file of files) {
        formData.append('files', file);
      }

      const data = await apiClient.upload<AdminStorageListing>('/admin/storage/files', formData);
      applyListing(data);
      alerts.success('파일을 업로드했습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '파일을 업로드하지 못했습니다.';
      setErrorMessage(message);
      alerts.error(message);
    } finally {
      setIsMutating(false);
      setActiveAction(null);
    }
  }

  async function deleteEntry(key: string, label: string) {
    const confirmed = window.confirm(`"${label}" 항목을 삭제할까요?`);
    if (!confirmed) return;

    setIsMutating(true);
    setActiveAction('delete');

    try {
      const data = await apiClient.delete<AdminStorageListing>(
        `/admin/storage?prefix=${encodeURIComponent(latestPrefixRef.current)}&key=${encodeURIComponent(key)}`
      );
      applyListing(data);
      alerts.success(
        data.deletedKeys && data.deletedKeys > 1
          ? `${data.deletedKeys}개의 저장소 항목을 삭제했습니다.`
          : '항목을 삭제했습니다.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '항목을 삭제하지 못했습니다.';
      setErrorMessage(message);
      alerts.error(message);
    } finally {
      setIsMutating(false);
      setActiveAction(null);
    }
  }

  const selectedObject =
    listing?.objects.find(item => item.key === selectedObjectKey) || listing?.objects[0] || null;

  return {
    listing,
    isLoading,
    isMutating,
    activeAction,
    errorMessage,
    selectedObject,
    currentPrefix,
    navigateTo,
    refresh: () => loadListing(currentPrefix, false),
    createFolder,
    uploadFiles,
    deleteEntry,
    selectObject: setSelectedObjectKey,
  };
}
