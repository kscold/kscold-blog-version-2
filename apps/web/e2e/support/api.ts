import type { Page, Route } from '@playwright/test';

const TRANSPARENT_PIXEL = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);

/** 백엔드 공통 응답 엔벌로프 (Cypress 스펙의 success() 와 동일 구조) */
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
  /** glob(`**`) 또는 정규식 — Cypress intercept 의 URL 패턴 대응 */
  times?: number;
}

/**
 * cy.intercept(method, urlGlob, { statusCode, body }) 대응.
 * urlPattern 에 `*` glob 을 쓸 수 있고, 메서드까지 일치할 때만 fulfill 한다.
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
