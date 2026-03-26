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
        // ... existing code ...
        // If sending FormData, let axios set the correct Content-Type with boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        const isBrandEndpoint = config.url?.includes('/brand/');
        
        let token: string | null = null;
        if (isBrandEndpoint) {
          // For brand endpoints, get brand token from localStorage
          if (typeof window !== 'undefined') {
            try {
              const brandData = localStorage.getItem('brand_user');
              console.log('[API Client] Checking for brand_user in localStorage:', !!brandData);
              if (brandData) {
                const brand = JSON.parse(brandData);
                token = brand.token;
                // Mark this request as using brand auth (skip token refresh)
                (config as any).isBrandAuth = true;
                console.log('[API Client] Using brand auth for brand endpoint:', config.url, 'Token:', token ? 'YES' : 'NO');
              } else {
                console.warn('[API Client] No brand_user found in localStorage for endpoint:', config.url);
              }
            } catch (e) {
              console.error('Error parsing brand data:', e);
            }
          }
        } else {
          // For regular user endpoints, use standard token manager
          token = TokenManager.getToken();
        }
        
        // Add auth token if available and not explicitly skipped
        if (token && !(config as any).skipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            hasFormData: config.data instanceof FormData,
            contentType: config.headers['Content-Type']
          });
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
          isBrandAuth?: boolean;
        };

        // Handle 401 errors - Token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Do not redirect or refresh if the 401 originated from a login/register request
          if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register')) {
             return Promise.reject(error);
          }

          // Check if this request used brand authentication
          if (originalRequest.isBrandAuth) {
            // For brand auth, never attempt refresh - just logout and redirect
            console.log('[API Client] Brand auth failed, redirecting to brand login');
            if (typeof window !== 'undefined') {
              // Clear brand session
              localStorage.removeItem('brand_user');
              localStorage.removeItem('token');
              window.location.href = '/brand-login';
            }
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Backend currently does not have a refresh token implementation
            // so we immediately log out the user on a 401 to prevent infinite loops
            throw new Error('Token refresh not supported');
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
        if (error.message || error.response?.status) {
          console.error('[API Client Raw Error]:', {
            message: error.message || 'Unknown error',
            status: error.response?.status ?? 'N/A',
            statusText: error.response?.statusText || 'N/A',
            data: error.response?.data,
            url: error.config?.url || 'Unknown URL',
          });
        }
        
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
      // Return the full data object if it contains pagination data, 
      // otherwise fallback to returning the extracted .data field or the object itself
      if (response.data && (response.data as any).pagination) {
        return response.data as T;
      }
      return (response.data?.data || response.data) as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error);
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
      if (response.data && (response.data as any).pagination) {
        return response.data as T;
      }
      return (response.data?.data || response.data) as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error);
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
      if (response.data && (response.data as any).pagination) {
        return response.data as T;
      }
      return (response.data?.data || response.data) as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error);
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
      if (response.data && (response.data as any).pagination) {
        return response.data as T;
      }
      return (response.data?.data || response.data) as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error);
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
      if (response.data && (response.data as any).pagination) {
        return response.data as T;
      }
      return (response.data?.data || response.data) as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error);
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
          'Content-Type': undefined,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      if (response.data && (response.data as any).pagination) {
        return response.data as T;
      }
      return (response.data?.data || response.data) as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error);
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
