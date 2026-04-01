import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const binary = atob(normalized);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    return payload;
  } catch {
    return null;
  }
}

function decodeJwtHeader(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown>): boolean {
  if (typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now();
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set('auth-token', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const authHeader = request.headers.get('authorization');

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (isAdminRoute) {
    const jwtToken = token || authHeader?.replace('Bearer ', '');

    if (!jwtToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(jwtToken);
    const header = decodeJwtHeader(jwtToken);
    const isValidAdminToken =
      !!payload &&
      !!header &&
      header.alg === 'HS256' &&
      !isExpired(payload) &&
      payload.type === 'access' &&
      payload.role === 'ADMIN';

    if (!isValidAdminToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return clearAuthCookie(NextResponse.redirect(loginUrl));
    }
  }

  if (isLoginPage && token) {
    const payload = decodeJwtPayload(token);
    const header = decodeJwtHeader(token);
    const isValidToken =
      !!payload &&
      !!header &&
      header.alg === 'HS256' &&
      !isExpired(payload) &&
      payload.type === 'access';

    if (!isValidToken) {
      return clearAuthCookie(NextResponse.next());
    }

    const target = payload.role === 'ADMIN' ? '/admin' : '/';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
