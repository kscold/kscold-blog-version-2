'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/shared/api/api-client';

interface AccessRequest {
  id: string;
  userId: string;
  username: string;
  categoryId: string;
  categoryName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  createdAt: string;
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.get<AccessRequest[]>('/admin/access-requests');
      setRequests(data);
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiClient.put(`/admin/access-requests/${id}/${action}`);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch { /* noop */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-surface-900">열람 요청 관리</h1>
        <span className="inline-flex w-fit rounded-full bg-surface-100 px-3 py-1 text-sm font-medium text-surface-600">
          {requests.length}건 대기
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-surface-400">로딩 중...</p>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-surface-200 bg-white p-12 text-center">
          <p className="text-sm text-surface-400">대기 중인 요청이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div
              key={req.id}
              className="flex flex-col gap-4 rounded-xl border border-surface-200 bg-white px-5 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900">{req.username}</p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {req.categoryName} · {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                </p>
                {req.message && (
                  <p className="mt-1 break-words text-xs text-surface-500">&quot;{req.message}&quot;</p>
                )}
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                <button
                  onClick={() => handle(req.id, 'approve')}
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  승인
                </button>
                <button
                  onClick={() => handle(req.id, 'reject')}
                  className="rounded-lg bg-surface-200 px-4 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-300 transition-colors"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
