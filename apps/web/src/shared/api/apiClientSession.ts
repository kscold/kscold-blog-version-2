import { AxiosInstance } from 'axios';
import {
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  hasRefreshToken,
  storeAccessToken,
  storeRefreshToken,
} from '@/shared/lib/authTokenStorage';
import { performTokenRefresh } from '@/shared/api/apiClientRefresh';

export class ApiClientSession {
  private readonly apiUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  applyAccessToken(client: AxiosInstance) {
    const token = getAccessToken();
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common.Authorization;
    }
  }

  clearTokens() {
    clearStoredAuth();
  }

  setTokens(accessToken: string, refreshToken?: string) {
    storeAccessToken(accessToken);
    if (refreshToken) {
      storeRefreshToken(refreshToken);
    }
  }

  getAccessToken() {
    return getAccessToken();
  }

  hasRefreshToken() {
    return hasRefreshToken();
  }

  async restoreSession() {
    return this.refreshAccessToken();
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      return null;
    }

    this.refreshPromise = performTokenRefresh(this.apiUrl, currentRefreshToken)
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }
}

