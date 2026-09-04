import {
  clearLegacyAuthTokens,
  clearStoredAuth,
  getLegacyRefreshToken,
  hasLegacyAuthTokens,
} from '@/shared/lib/authTokenStorage';
import { performTokenRefresh } from '@/shared/api/apiClientRefresh';

export class ApiClientSession {
  private readonly apiUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  clearTokens() {
    clearStoredAuth();
  }

  establishSession() {
    clearLegacyAuthTokens();
  }

  async refreshSession(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = performTokenRefresh(this.apiUrl, getLegacyRefreshToken()).finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  async migrateLegacySession(): Promise<boolean> {
    if (!hasLegacyAuthTokens()) {
      return true;
    }

    const migrated = await this.refreshSession();
    clearLegacyAuthTokens();
    return migrated;
  }
}
