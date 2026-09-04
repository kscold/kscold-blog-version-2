'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

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

const SENSITIVE_QUERY_KEYS = new Set([
  'access_token',
  'code',
  'id_token',
  'refresh_token',
  'token',
]);

function buildAnalyticsLocation(pathname: string, searchParams: URLSearchParams) {
  const sanitizedSearchParams = new URLSearchParams(searchParams);

  for (const key of sanitizedSearchParams.keys()) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      sanitizedSearchParams.delete(key);
    }
  }

  const search = sanitizedSearchParams.toString();
  const pagePath = `${pathname}${search ? `?${search}` : ''}`;

  return {
    pagePath,
    pageLocation: new URL(pagePath, window.location.origin).href,
  };
}

export function AnalyticsScripts({ gaId }: AnalyticsScriptsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId || !window.gtag) return;
    const { pagePath, pageLocation } = buildAnalyticsLocation(
      pathname,
      new URLSearchParams(searchParams.toString())
    );
    window.gtag('config', gaId, {
      page_path: pagePath,
      page_location: pageLocation,
      page_title: document.title,
    });
  }, [gaId, pathname, searchParams]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
