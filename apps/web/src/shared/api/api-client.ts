import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/entities/user/model/authStore';
import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';

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

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
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
        const requestPath = this.extractPath(originalRequest?.url);

        if (originalRequest && status === 401 && !originalRequest._retry && this.shouldAttemptRefresh(requestPath)) {
          originalRequest._retry = true;

          const newToken = await this.refreshAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          }

          this.forceLogout();
          return Promise.reject(error);
        }

        if (this.shouldForceLogout(status, requestPath)) {
          this.forceLogout();
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      useAuthStore.getState().setToken(token);

      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60}; SameSite=Lax${secure}`;
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().clearAuth();
      document.cookie = 'auth-token=; path=/; max-age=0';
    }
  }

  private async doRefreshToken(): Promise<string | null> {
    try {
      const currentRefreshToken = this.getRefreshToken();
      if (!currentRefreshToken) return null;

      const response = await axios.post(`${this.apiUrl}/auth/refresh`, {
        refreshToken: currentRefreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      this.setAccessToken(accessToken);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private extractPath(url?: string): string {
    if (!url) return '';
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

  private shouldAttemptRefresh(path: string): boolean {
    return !['/auth/login', '/auth/register', '/auth/refresh'].includes(path);
  }

  private shouldForceLogout(status: number | undefined, path: string): boolean {
    if (status === 401) {
      return path === '/auth/refresh' || path === '/auth/me';
    }

    if (status === 403) {
      return this.isAdminProtectedPath(path) || path === '/auth/me';
    }

    return false;
  }

  private isAdminProtectedPath(path: string): boolean {
    return path.startsWith('/admin') || path.includes('/admin/') || path.endsWith('/admin');
  }

  private forceLogout(): void {
    this.clearTokens();

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      const redirect = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
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
    const response = await this.client.post<{ data: T }>(url, formData);
    return response.data.data;
  }

  public setToken(token: string, refreshToken?: string): void {
    this.setAccessToken(token);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  public removeToken(): void {
    this.clearTokens();
  }

  public getToken(): string | null {
    return this.getAccessToken();
  }

  public hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  public async restoreSession(): Promise<string | null> {
    return this.refreshAccessToken();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
