import type { User } from '@/shared/model/types/user';

const REDIRECT_BASE_ORIGIN = 'https://kscold.local';

export function resolveSafeRedirect(requestedPath: string, role: User['role']): string {
  const fallback = role === 'ADMIN' ? '/admin' : '/';

  try {
    const target = new URL(requestedPath, REDIRECT_BASE_ORIGIN);
    if (!requestedPath.startsWith('/') || target.origin !== REDIRECT_BASE_ORIGIN) {
      return fallback;
    }

    const internalPath = `${target.pathname}${target.search}${target.hash}`;
    if (target.pathname.startsWith('/admin') && role !== 'ADMIN') {
      return '/';
    }

    return internalPath;
  } catch {
    return fallback;
  }
}
