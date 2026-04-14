import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';
import {
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  hasRefreshToken,
  storeAccessToken,
  storeRefreshToken,
} from '@/shared/lib/authTokenStorage';
import {
  extractRequestPath,
  forceLogout,
  shouldAttemptRefresh,
  shouldForceLogout,
} from '@/shared/api/apiClientPolicies';
import { performTokenRefresh } from '@/shared/api/apiClientRefresh';

class ApiClient {
  private client: AxiosInstance;
  private readonly apiUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.apiUrl = resolveApiBaseUrl();
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private toAppError(error: unknown): Error {
    if (!axios.isAxiosError(error)) {
      return error instanceof Error ? error : new Error('요청을 처리하는 중 오류가 발생했습니다.');
    }

    const payload = error.response?.data as { message?: string; errorCode?: string } | undefined;
    const message =
      payload?.message
      || (error.response?.status === 405 ? '지원하지 않는 요청 방식입니다.' : undefined)
      || error.message
      || '요청을 처리하는 중 오류가 발생했습니다.';

    const normalizedError = new Error(message) as Error & {
      status?: number;
      errorCode?: string;
      cause?: unknown;
    };

    normalizedError.name = 'ApiClientError';
    normalizedError.status = error.response?.status;
    normalizedError.errorCode = payload?.errorCode;
    normalizedError.cause = error;

    return normalizedError;
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };
        const status = error.response?.status;
        const requestPath = extractRequestPath(originalRequest?.url);

        if (originalRequest && status === 401 && !originalRequest._retry && shouldAttemptRefresh(requestPath)) {
          originalRequest._retry = true;

          const newToken = await this.refreshAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          }

          this.clearTokens();
          forceLogout();
          return Promise.reject(this.toAppError(error));
        }

        if (shouldForceLogout(status, requestPath)) {
          this.clearTokens();
          forceLogout();
        }

        return Promise.reject(this.toAppError(error));
      }
    );
  }

  private clearTokens(): void {
    clearStoredAuth();
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      return null;
    }

    this.refreshPromise = performTokenRefresh(this.apiUrl, currentRefreshToken).finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<{ data: T }>(url, config);
    return response.data.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<{ data: T }>(url, data, config);
    return response.data.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<{ data: T }>(url, data, config);
    return response.data.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    if (response.status === 204 || !response.data) {
      return undefined as T;
    }
    return (response.data as { data: T }).data;
  }

  public async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<{ data: T }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  public setToken(token: string, refreshToken?: string): void {
    storeAccessToken(token);
    if (refreshToken) {
      storeRefreshToken(refreshToken);
    }
  }

  public removeToken(): void {
    this.clearTokens();
  }

  public getToken(): string | null {
    return getAccessToken();
  }

  public hasRefreshToken(): boolean {
    return hasRefreshToken();
  }

  public async restoreSession(): Promise<string | null> {
    return this.refreshAccessToken();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
