'use client';

import { usePathname, useSearchParams, useParams } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { isUntrackedPage } from '@/shared/config/standalonePages';
import { scheduleAnalyticsLoad, trackAnalyticsPage } from '@/shared/lib/analytics';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
    gtag?: (...args: unknown[]) => void;
  }
}

interface AnalyticsScriptsProps {
  gtmId?: string;
  gaId?: string;
}

export function AnalyticsScripts({ gaId }: AnalyticsScriptsProps) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isTrackingExcluded = isAdminPage || isUntrackedPage(params, pathname);

  useLayoutEffect(() => {
    if (!gaId) return;
    // 이미 로드한 GA와 예약된 로드 모두 현재 경로의 제외 정책을 따른다.
    Object.assign(window, { [`ga-disable-${gaId}`]: isTrackingExcluded });
    if (isTrackingExcluded) return;
    return scheduleAnalyticsLoad(gaId, () => trackAnalyticsPage(gaId, pathname, query));
  }, [gaId, isTrackingExcluded, pathname, query]);

  return null;
}
