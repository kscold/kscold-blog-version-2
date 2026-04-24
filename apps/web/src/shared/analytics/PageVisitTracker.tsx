'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAccessToken } from '@/shared/lib/authTokenStorage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    fetch(`${API_BASE}/analytics/page-visit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ path: pathname }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // 트래킹 실패는 무시
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
