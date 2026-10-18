/** 경로가 바뀌어 추적 제외 화면으로 들어가면 예약한 스크립트 로드도 취소한다. */
export function scheduleAnalyticsLoad(gaId: string, onReady: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timerId: number | undefined;

  const load = () => {
    if (cancelled || Reflect.get(window, `ga-disable-${gaId}`)) return;
    initializeAnalytics(gaId);
    onReady();
  };
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(load);
    } else {
      timerId = window.setTimeout(load, 0);
    }
  };

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener('load', schedule);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timerId !== undefined) window.clearTimeout(timerId);
  };
}

function initializeAnalytics(gaId: string) {
  const scriptId = `analytics-${gaId}`;
  if (document.getElementById(scriptId)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // GA가 요구하는 인자 큐 형식을 유지한다.
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId, { send_page_view: false });

  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);
}

const SENSITIVE_QUERY_KEYS = new Set([
  'access_token', 'code', 'id_token', 'refresh_token', 'token',
]);

export function trackAnalyticsPage(gaId: string, pathname: string, query: string) {
  if (!window.gtag || Reflect.get(window, `ga-disable-${gaId}`)) return;
  const searchParams = new URLSearchParams(query);
  for (const key of Array.from(searchParams.keys())) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) searchParams.delete(key);
  }
  const search = searchParams.toString();
  const pagePath = `${pathname}${search ? `?${search}` : ''}`;
  window.gtag('config', gaId, {
    page_path: pagePath,
    page_location: new URL(pagePath, window.location.origin).href,
    page_title: document.title,
  });
}
