// API Client - Main Axios instance with interceptors
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, RETRY_CONFIG, ENDPOINTS } from './config';
import { TokenManager } from './tokenManager';
import { ApiErrorHandler } from './errorHandler';
import type { ApiError, ApiResponse, RequestConfig, AuthTokens } from './types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Request Interceptor - Add auth token to requests
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenManager.getToken();
        
        // Add auth token if available and not explicitly skipped
        if (token && !(config as any).skipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Response Interceptor - Handle responses and errors
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
          _retryCount?: number;
          skipAuth?: boolean;
          skipRetry?: boolean;
        };

        // Handle 401 errors - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            const newToken = await TokenManager.refreshToken(async () => {
              const response = await axios.post(
                `${API_CONFIG.baseURL}${ENDPOINTS.REFRESH_TOKEN}`,
                {
                  refreshToken: TokenManager.getRefreshToken(),
                }
              );
              return response.data as AuthTokens;
            });

            if (newToken) {
              // Process queued requests
              this.processQueue(null, newToken);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            TokenManager.logout();
            
            // Redirect to login (if in browser)
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle retry logic for network errors and 5xx errors
        if (!originalRequest.skipRetry) {
          const retryCount = originalRequest._retryCount || 0;
          const apiError = ApiErrorHandler.handleError(error);

          if (ApiErrorHandler.shouldRetry(apiError, retryCount, RETRY_CONFIG.retries)) {
            originalRequest._retryCount = retryCount + 1;

            // Calculate delay with exponential backoff
            const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount);

            console.log(
              `[API Retry] Attempt ${retryCount + 1}/${RETRY_CONFIG.retries} after ${delay}ms`
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));

            return this.axiosInstance(originalRequest);
          }
        }

        // Log error
        const apiError = ApiErrorHandler.handleError(error);
        ApiErrorHandler.logError(apiError, error.config?.url);
        
        // Log raw error details for debugging
        console.error('[API Client Raw Error]:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Download file
   */
  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.axiosInstance.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Get the raw axios instance (for advanced usage)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
