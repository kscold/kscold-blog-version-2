import { cookies } from 'next/headers';
import type { PageResponse } from '@/shared/model/types/api';
import { API_BASE_URL } from './constants';

const DEFAULT_SEO_API_TIMEOUT_MS = 8_000;
const MAX_SEO_API_TIMEOUT_MS = 300_000;
const DEFAULT_SEO_PAGE_SIZE = 100;
const MAX_SEO_PAGE_SIZE = 100;
const MAX_SEO_PAGE_REQUESTS = 500;

function getSeoApiTimeoutMs() {
  const configuredTimeout = Number(process.env.SEO_API_TIMEOUT_MS);

  return Number.isInteger(configuredTimeout) &&
    configuredTimeout > 0 &&
    configuredTimeout <= MAX_SEO_API_TIMEOUT_MS
    ? configuredTimeout
    : DEFAULT_SEO_API_TIMEOUT_MS;
}

export async function fetchPublicApi<T>(path: string, revalidate = 3600): Promise<T | null> {
  return fetchSeoApi<T>(
    path,
    {
      next: { revalidate },
    },
    [404]
  );
}

export async function fetchAllPublicApiPages<T>(
  path: string,
  pageSize = DEFAULT_SEO_PAGE_SIZE,
  revalidate = 3600
): Promise<T[] | null> {
  const items: T[] = [];
  const normalizedPageSize = normalizeSeoPageSize(pageSize);
  let pageNumber = 0;

  while (pageNumber < MAX_SEO_PAGE_REQUESTS) {
    const separator = path.includes('?') ? '&' : '?';
    const page = await fetchPublicApi<PageResponse<T>>(
      `${path}${separator}page=${pageNumber}&size=${normalizedPageSize}`,
      revalidate
    );

    if (!page) {
      return null;
    }

    validateSeoPage(page, pageNumber);
    items.push(...page.content);
    if (page.last || pageNumber + 1 >= page.totalPages) {
      return items;
    }

    pageNumber += 1;
  }

  throw new Error(`SEO API 페이지 수가 안전 상한을 초과했습니다. path=${path}`);
}

function normalizeSeoPageSize(pageSize: number) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    return DEFAULT_SEO_PAGE_SIZE;
  }

  return Math.min(pageSize, MAX_SEO_PAGE_SIZE);
}

function validateSeoPage<T>(page: PageResponse<T>, pageNumber: number) {
  if (!Array.isArray(page.content) || !Number.isInteger(page.totalPages) || page.totalPages < 0) {
    throw new Error(`SEO API 페이지 응답이 올바르지 않습니다. page=${pageNumber}`);
  }
  if (!page.last && pageNumber + 1 < page.totalPages && page.content.length === 0) {
    throw new Error(`SEO API 페이지 수집이 진행되지 않습니다. page=${pageNumber}`);
  }
}

export async function fetchViewerApi<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  return fetchSeoApi<T>(
    path,
    {
      headers: authToken ? { Cookie: `auth-token=${authToken}` } : {},
      cache: 'no-store',
    },
    [401, 403, 404]
  );
}

async function fetchSeoApi<T>(
  path: string,
  init: RequestInit,
  missingStatuses: readonly number[]
): Promise<T | null> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const requestUrl = `${API_BASE_URL}${normalizedPath}`;
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...init,
      signal: AbortSignal.timeout(getSeoApiTimeoutMs()),
    });
  } catch {
    throw new Error('SEO API에 연결할 수 없습니다.');
  }

  if (missingStatuses.includes(response.status)) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`SEO API 응답이 실패했습니다. status=${response.status}`);
  }

  try {
    const payload = await response.json();
    return (payload?.data ?? payload) as T;
  } catch {
    throw new Error('SEO API 응답을 해석할 수 없습니다.');
  }
}
