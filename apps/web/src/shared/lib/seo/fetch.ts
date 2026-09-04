import { cookies } from 'next/headers';
import type { PageResponse } from '@/shared/model/types/api';
import { API_BASE_URL } from './constants';

export async function fetchPublicApi<T>(path: string, revalidate = 3600): Promise<T | null> {
  return fetchSeoApi<T>(path, {
    next: { revalidate },
  });
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

  return fetchSeoApi<T>(path, {
    headers: authToken
      ? { Cookie: `auth-token=${authToken}` }
      : {},
    cache: 'no-store',
  });
}

async function fetchSeoApi<T>(path: string, init: RequestInit): Promise<T | null> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const requestUrl = `${API_BASE_URL}${normalizedPath}`;

  try {
    const response = await fetch(requestUrl, init);
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return (payload?.data ?? payload) as T;
  } catch (error) {
    console.error(`Failed to fetch SEO API: ${requestUrl}`, error);
    return null;
  }
}
