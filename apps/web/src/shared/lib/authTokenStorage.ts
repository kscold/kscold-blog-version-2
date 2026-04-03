import { notifyAuthSessionCleared, notifyAuthTokenChanged } from '@/shared/model/authSessionBridge';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_STORAGE_KEY = 'auth-storage';
const ACCESS_TOKEN_COOKIE = 'auth-token';
const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60;

function isBrowser() {
  return typeof window !== 'undefined';
}

function resolveCookieSuffix() {
  return window.location.protocol === 'https:' ? '; Secure' : '';
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function hasRefreshToken() {
  return !!getRefreshToken();
}

export function storeAccessToken(token: string) {
  if (!isBrowser()) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=${ACCESS_TOKEN_COOKIE_MAX_AGE}; SameSite=Lax${resolveCookieSuffix()}`;
  notifyAuthTokenChanged(token);
}

export function storeRefreshToken(token: string) {
  if (!isBrowser()) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearStoredAuth() {
  if (!isBrowser()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;
  notifyAuthTokenChanged(null);
  notifyAuthSessionCleared();
}
