import { cookies } from 'next/headers';
import type { PageResponse } from '@/shared/model/types/api';
import { API_BASE_URL } from './constants';

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
  pageSize = 100,
  revalidate = 3600
): Promise<T[] | null> {
  const items: T[] = [];
  let pageNumber = 0;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const page = await fetchPublicApi<PageResponse<T>>(
      `${path}${separator}page=${pageNumber}&size=${pageSize}`,
      revalidate
    );

    if (!page) {
      return null;
    }

    items.push(...page.content);
    if (page.last || pageNumber + 1 >= page.totalPages) {
      return items;
    }

    pageNumber += 1;
  }
}

export async function fetchViewerApi<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  return fetchSeoApi<T>(
    path,
    {
      headers: authToken
        ? { Cookie: `auth-token=${authToken}` }
        : {},
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
    response = await fetch(requestUrl, init);
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
