import { cookies } from 'next/headers';
import { API_BASE_URL } from './constants';

export async function fetchPublicApi<T>(path: string, revalidate = 3600): Promise<T | null> {
  return fetchSeoApi<T>(path, {
    next: { revalidate },
  });
}

export async function fetchViewerApi<T>(path: string, revalidate = 3600): Promise<T | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  return fetchSeoApi<T>(
    path,
    authToken
      ? {
          headers: {
            Cookie: `auth-token=${authToken}`,
          },
          cache: 'no-store',
        }
      : {
          next: { revalidate },
        }
  );
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
