import { notifyAuthSessionCleared } from '@/shared/model/authSessionBridge';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_STORAGE_KEY = 'auth-storage';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getLegacyRefreshToken() {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function hasLegacyAuthTokens() {
  if (!isBrowser()) return false;
  try {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) || getLegacyRefreshToken());
  } catch {
    return false;
  }
}

export function clearLegacyAuthTokens() {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // 저장소 사용이 제한되어도 HttpOnly 쿠키 세션은 유지할 수 있다.
  }
}

export function clearStoredAuth() {
  if (!isBrowser()) return;

  clearLegacyAuthTokens();
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // 저장소 사용이 제한된 브라우저에서도 서버 로그아웃은 계속 처리한다.
  }
  notifyAuthSessionCleared();
}
