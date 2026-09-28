'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteAdminDocument,
  fetchAdminDocuments,
  updateAdminDocument,
} from '../api/adminDocumentsApi';
import { documentErrorMessage } from '../lib/adminDocuments';
import type {
  AdminDocument,
  AdminDocumentCategory,
  AdminDocumentDetails,
  AdminDocumentFilter,
  AdminDocumentPage,
} from './adminDocumentTypes';

export function useAdminDocuments(fixedCategory?: AdminDocumentCategory) {
  const [filter, setFilter] = useState<AdminDocumentFilter>({
    category: fixedCategory ?? '',
    query: '',
    page: 0,
  });
  const [listing, setListing] = useState<AdminDocumentPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const mutationController = useRef<AbortController | null>(null);
  const mutationLocked = useRef(false);
  const refresh = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setListing(null);
    setError('');
    void fetchAdminDocuments(filter, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        if (filter.page > 0 && filter.page >= data.totalPages) {
          setFilter(value => ({ ...value, page: Math.max(0, data.totalPages - 1) }));
          return;
        }
        setListing(data);
      })
      .catch(cause => {
        if (!controller.signal.aborted) setError(documentErrorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [filter, revision]);

  useEffect(() => () => mutationController.current?.abort(), []);

  const changeFilter = useCallback(
    (next: Pick<AdminDocumentFilter, 'category' | 'query'>) => {
      setFilter({ category: fixedCategory ?? next.category, query: next.query.trim(), page: 0 });
      setNotice('');
    },
    [fixedCategory]
  );

  const changePage = useCallback((page: number) => {
    setFilter(value => ({ ...value, page }));
    setNotice('');
  }, []);

  async function mutate(operation: (signal: AbortSignal) => Promise<unknown>, message: string) {
    if (mutationLocked.current) return false;
    mutationLocked.current = true;
    const controller = new AbortController();
    mutationController.current = controller;
    setIsMutating(true);
    setError('');
    setNotice('');
    try {
      await operation(controller.signal);
      if (controller.signal.aborted) return false;
      setNotice(message);
      refresh();
      return true;
    } catch (cause) {
      if (!controller.signal.aborted) setError(documentErrorMessage(cause));
      return false;
    } finally {
      if (!controller.signal.aborted) setIsMutating(false);
      mutationLocked.current = false;
    }
  }

  async function saveDocument(document: AdminDocument, details: AdminDocumentDetails) {
    const isMovingToAnotherSpace = !!fixedCategory && details.category !== fixedCategory;
    const saved = await mutate(
      signal => updateAdminDocument(document.id, details, signal),
      isMovingToAnotherSpace
        ? '다른 관리 공간으로 문서를 이동했습니다.'
        : '문서 정보를 저장했습니다.'
    );
    if (saved && isMovingToAnotherSpace) setListing(null);
    return saved;
  }

  async function removeDocument(document: AdminDocument) {
    if (
      !window.confirm(
        `“${document.title}” (${document.fileName}) 파일을 삭제할까요? 삭제한 파일은 복구할 수 없습니다.`
      )
    )
      return false;
    return mutate(
      signal => deleteAdminDocument(document.id, signal),
      '선택한 문서를 삭제했습니다.'
    );
  }

  return {
    filter,
    listing,
    isLoading,
    isMutating,
    error,
    notice,
    refresh,
    changeFilter,
    changePage,
    saveDocument,
    removeDocument,
  };
}
