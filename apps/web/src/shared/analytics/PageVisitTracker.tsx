'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const controller = new AbortController();
    fetch(`${API_BASE}/analytics/page-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
