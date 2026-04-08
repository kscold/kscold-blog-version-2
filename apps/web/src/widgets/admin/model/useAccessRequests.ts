'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/shared/api/api-client';

export interface AccessRequest {
  id: string;
  userId: string;
  username: string;
  postId?: string;
  postTitle?: string;
  postSlug?: string;
  categoryId: string;
  categoryName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  grantScope?: 'POST' | 'CATEGORY' | null;
  message?: string;
  createdAt: string;
}

export type GrantScope = 'POST' | 'CATEGORY';

export function useAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [scopeById, setScopeById] = useState<Record<string, GrantScope>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.get<AccessRequest[]>('/admin/access-requests');
      setRequests(data);
      setScopeById(
        Object.fromEntries(data.map(request => [request.id, request.postId ? 'POST' : 'CATEGORY']))
      );
    } catch {
      // no-op
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRequest = useCallback(
    async (request: AccessRequest, action: 'approve' | 'reject') => {
      try {
        if (action === 'approve') {
          await apiClient.put(`/admin/access-requests/${request.id}/approve`, {
            grantScope: scopeById[request.id] ?? (request.postId ? 'POST' : 'CATEGORY'),
          });
        } else {
          await apiClient.put(`/admin/access-requests/${request.id}/reject`);
        }
        setRequests(prev => prev.filter(item => item.id !== request.id));
      } catch {
        // no-op
      }
    },
    [scopeById]
  );

  const selectScope = useCallback((requestId: string, scope: GrantScope) => {
    setScopeById(prev => ({ ...prev, [requestId]: scope }));
  }, []);

  return {
    requests,
    scopeById,
    loading,
    handleRequest,
    selectScope,
  };
}
