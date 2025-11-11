// Error Handler Utility
import { AxiosError } from 'axios';
import type { ApiError } from './types';

export class ApiErrorHandler {
  /**
   * Parse and format error from axios error response
   */
  static handleError(error: any): ApiError {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        const { data, status } = axiosError.response;
        return {
          message: (data as any)?.message || axiosError.message || 'An error occurred',
          status,
          code: (data as any)?.code,
          errors: (data as any)?.errors,
        };
      } else if (axiosError.request) {
        // Request made but no response received
        return {
          message: 'No response from server. Please check your connection.',
          status: 0,
          code: 'NETWORK_ERROR',
        };
      }
    }
    
    // Generic error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Log error to console (can be extended to send to logging service)
   */
  static logError(error: ApiError, context?: string): void {
    const errorObj = {
      message: error.message || 'Unknown error',
      status: error.status ?? 'N/A',
      code: error.code ?? 'N/A',
      errors: error.errors,
    };
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, errorObj);
  }

  /**
   * Check if error is authentication related
   */
  static isAuthError(error: ApiError): boolean {
    return error.status === 401 || error.status === 403;
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: ApiError): boolean {
    return error.code === 'NETWORK_ERROR' || error.status === 0;
  }

  /**
   * Check if error should trigger a retry
   */
  static shouldRetry(error: ApiError, retryCount: number, maxRetries: number): boolean {
    if (retryCount >= maxRetries) return false;
    
    // Retry on network errors and 5xx server errors
    return this.isNetworkError(error) || (error.status >= 500 && error.status < 600);
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authenticated. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Create a custom error notification
   */
  static createErrorNotification(error: ApiError): {
    title: string;
    message: string;
    type: 'error' | 'warning';
  } {
    const isWarning = error.status === 401 || error.status === 403;
    
    return {
      title: isWarning ? 'Authentication Required' : 'Error',
      message: this.getUserFriendlyMessage(error),
      type: isWarning ? 'warning' : 'error',
    };
  }
}

export default ApiErrorHandler;
