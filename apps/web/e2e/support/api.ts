import type { Page, Route } from '@playwright/test';

const TRANSPARENT_PIXEL = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);

/** 백엔드 공통 응답 엔벌로프 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string | null;
  errorCode?: string | null;
  timestamp: string;
}

export function success<T>(data: T): ApiEnvelope<T> {
  return {
    success: true,
    data,
    message: null,
    errorCode: null,
    timestamp: '2026-04-02T00:00:00',
  };
}

export function failure(message: string, errorCode = 'E000'): ApiEnvelope<null> {
  return {
    success: false,
    data: null,
    message,
    errorCode,
    timestamp: '2026-04-02T00:00:00',
  };
}

/** 비어있는 Spring Page 응답 */
export function emptyPage<T>(size = 10): {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
} {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size,
    number: 0,
    first: true,
    last: true,
    empty: true,
  };
}

export function pageOf<T>(content: T[], size = 10) {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    size,
    number: 0,
    first: true,
    last: content.length <= size,
    empty: content.length === 0,
  };
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface MockOptions {
  status?: number;
  times?: number;
}

/**
 * 지정한 메서드와 주소의 API 요청에 준비한 응답을 돌려준다.
 * urlPattern 에 `*` glob 이나 정규식을 쓸 수 있고, 메서드까지 일치할 때만 fulfill 한다.
 */
export async function mockApi(
  page: Page,
  method: Method,
  urlPattern: string | RegExp,
  body: unknown,
  options: MockOptions = {}
): Promise<void> {
  const { status = 200 } = options;
  const matcher =
    typeof urlPattern === 'string'
      ? globToRegExp(urlPattern)
      : urlPattern;

  await page.route(matcher, async (route: Route) => {
    if (route.request().method() !== method) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

/**
 * 모든 페이지의 공통 API와 외부 피드 이미지를 결정적인 응답으로 목킹한다.
 * 외부 CDN 상태가 UI 시나리오 결과에 영향을 주지 않도록 원격 최적화 요청을 대체한다.
 */
export async function mockShellApis(page: Page): Promise<void> {
  await page.route('**/_next/image?**', async route => {
    const source = new URL(route.request().url()).searchParams.get('url');
    if (source?.startsWith('http://') || source?.startsWith('https://')) {
      await route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PIXEL });
      return;
    }
    await route.fallback();
  });

  await mockApi(page, 'GET', '**/api/categories', success([]));
  await mockApi(page, 'GET', '**/api/tags/index', success([]));
  await mockApi(page, 'GET', /\/api\/feeds(?:\?|$)/, success(emptyPage()));
  await mockApi(page, 'GET', '**/api/feeds/tags', success([]));
}

/**
 * 목으로 받지 못한 API 요청이 실제 백엔드까지 가지 않게 막는다.
 * 운영 주소를 대상으로 돌려도 화면만 검증하고 데이터에는 닿지 않도록, 조회는 404로 답하고 변경 요청은 끊는다.
 * 나중에 등록한 목이 먼저 실행되므로 다른 목보다 앞서 호출해야 한다.
 */
export async function isolateBackendApi(
  page: Page,
  onBlocked?: (method: string, pathname: string) => void
): Promise<void> {
  await page.route(/\/api\//, async (route: Route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if (!pathname.startsWith('/api/')) {
      await route.fallback();
      return;
    }

    onBlocked?.(request.method(), pathname);
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(failure('테스트에서 준비하지 않은 요청입니다.')),
      });
      return;
    }
    await route.abort('blockedbyclient');
  });
  // 채팅 웹소켓도 서버로 잇지 않고 열린 채로만 둔다.
  await page.routeWebSocket(/\/api\/ws\//, () => {});
}

/** 어드민 대시보드가 호출하는 집계 API 들을 빈 값으로 목킹 */
export async function mockAdminDashboardApis(page: Page): Promise<void> {
  await mockApi(page, 'GET', '**/api/posts/admin*', success(emptyPage(5)));
  await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success(emptyPage(1)));
  await mockApi(page, 'GET', '**/api/vault/notes*', success(emptyPage(1)));
  await mockApi(page, 'GET', '**/api/admin/chat/rooms', success([]));
}

/** `**` `*` glob 패턴을 URL 매칭 정규식으로 변환 */
function globToRegExp(glob: string): RegExp {
  const doubleStarPlaceholder = '__DOUBLE_STAR_GLOB__';
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, doubleStarPlaceholder)
    .replace(/\*/g, '[^/?#]*')
    .replaceAll(doubleStarPlaceholder, '.*');
  return new RegExp(escaped);
}
