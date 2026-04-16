import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';
import {
  extractRequestPath,
  forceLogout,
  shouldAttemptRefresh,
  shouldForceLogout,
} from '@/shared/api/apiClientPolicies';
import { toApiClientError } from '@/shared/api/apiClientError';
import { ApiClientSession } from '@/shared/api/apiClientSession';

class ApiClient {
  private client: AxiosInstance;
  private readonly apiUrl: string;
  private readonly session: ApiClientSession;

  constructor() {
    this.apiUrl = resolveApiBaseUrl();
    this.session = new ApiClientSession(this.apiUrl);
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.session.getAccessToken();
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

          const newToken = await this.session.refreshAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          }

          this.session.clearTokens();
          forceLogout();
          return Promise.reject(toApiClientError(error));
        }

        if (shouldForceLogout(status, requestPath)) {
          this.session.clearTokens();
          forceLogout();
        }

        return Promise.reject(toApiClientError(error));
      }
    );
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
    this.session.setTokens(token, refreshToken);
    this.session.applyAccessToken(this.client);
  }

  public removeToken(): void {
    this.session.clearTokens();
    this.session.applyAccessToken(this.client);
  }

  public getToken(): string | null {
    return this.session.getAccessToken();
  }

  public hasRefreshToken(): boolean {
    return this.session.hasRefreshToken();
  }

  public async restoreSession(): Promise<string | null> {
    const accessToken = await this.session.restoreSession();
    this.session.applyAccessToken(this.client);
    return accessToken;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
