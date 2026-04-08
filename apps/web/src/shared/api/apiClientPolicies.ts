export function extractRequestPath(url?: string): string {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  const normalized = url.startsWith('/') ? url : `/${url}`;
  return normalized.split('?')[0].split('#')[0];
}

export function shouldAttemptRefresh(path: string): boolean {
  return !['/auth/login', '/auth/register', '/auth/refresh'].includes(path);
}

export function shouldForceLogout(status: number | undefined, path: string): boolean {
  if (status === 401) {
    return path === '/auth/refresh' || path === '/auth/me';
  }

  if (status === 403) {
    return isAdminProtectedPath(path) || path === '/auth/me';
  }

  return false;
}

export function forceLogout(redirectPath?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = redirectPath || `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname === '/login') {
    return;
  }

  window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
}

function isAdminProtectedPath(path: string): boolean {
  return path.startsWith('/admin') || path.includes('/admin/') || path.endsWith('/admin');
}
