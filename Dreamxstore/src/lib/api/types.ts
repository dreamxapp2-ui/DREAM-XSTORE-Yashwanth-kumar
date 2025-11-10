// API Types and Interfaces

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

export interface RequestConfig {
  retry?: Partial<RetryConfig>;
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin' | 'superadmin';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
