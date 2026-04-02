'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
    gtag?: (...args: unknown[]) => void;
    __KSCOLD_GTM_INITIALIZED__?: boolean;
    __KSCOLD_GA_INITIALIZED__?: boolean;
  }
}

interface AnalyticsScriptsProps {
  gtmId?: string;
  gaId?: string;
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function AnalyticsScripts({ gtmId, gaId }: AnalyticsScriptsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (!gtmId) {
      return;
    }

    ensureDataLayer().push({
      'gtm.start': Date.now(),
      event: 'gtm.js',
    });

    if (window.__KSCOLD_GTM_INITIALIZED__) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kscold-gtm="true"]'
    );

    if (existingScript) {
      window.__KSCOLD_GTM_INITIALIZED__ = true;
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    script.dataset.kscoldGtm = 'true';
    document.head.appendChild(script);
    window.__KSCOLD_GTM_INITIALIZED__ = true;
  }, [gtmId]);

  useEffect(() => {
    if (!gaId) {
      return;
    }

    ensureDataLayer();

    if (!window.gtag) {
      window.gtag = (...args: unknown[]) => {
        ensureDataLayer().push(args as unknown as IArguments);
      };
    }

    if (!window.__KSCOLD_GA_INITIALIZED__) {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-kscold-ga="true"]'
      );

      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script.dataset.kscoldGa = 'true';
        document.head.appendChild(script);
      }

      window.gtag('js', new Date());
      window.__KSCOLD_GA_INITIALIZED__ = true;
    }

    const pagePath = `${pathname}${search ? `?${search}` : ''}`;
    window.gtag('config', gaId, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gaId, pathname, search]);

  useEffect(() => {
    if (!gtmId) {
      return;
    }

    const pagePath = `${pathname}${search ? `?${search}` : ''}`;
    ensureDataLayer().push({
      event: 'page_view',
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gtmId, pathname, search]);

  return null;
}
