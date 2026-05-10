export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'GERANT' | 'COMMERCIAL' | 'COMPTABLE' | 'CLIENT';
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp?: string;
  path?: string;
}
