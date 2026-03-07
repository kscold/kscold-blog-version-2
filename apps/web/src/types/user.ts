export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}
