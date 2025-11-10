import { ApiErrorHandler } from '../errorHandler';
import type { ApiError } from '../types';

describe('ApiErrorHandler', () => {
  describe('isAuthError', () => {
    it('returns true for 401 status', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        status: 401,
      };
      expect(ApiErrorHandler.isAuthError(error)).toBe(true);
    });

    it('returns true for 403 status', () => {
      const error: ApiError = {
        message: 'Forbidden',
        status: 403,
      };
      expect(ApiErrorHandler.isAuthError(error)).toBe(true);
    });

    it('returns false for other statuses', () => {
      const error: ApiError = {
        message: 'Bad Request',
        status: 400,
      };
      expect(ApiErrorHandler.isAuthError(error)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('returns true for NETWORK_ERROR code', () => {
      const error: ApiError = {
        message: 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      };
      expect(ApiErrorHandler.isNetworkError(error)).toBe(true);
    });

    it('returns true for status 0', () => {
      const error: ApiError = {
        message: 'No response',
        status: 0,
      };
      expect(ApiErrorHandler.isNetworkError(error)).toBe(true);
    });

    it('returns false for server errors', () => {
      const error: ApiError = {
        message: 'Server error',
        status: 500,
      };
      expect(ApiErrorHandler.isNetworkError(error)).toBe(false);
    });
  });

  describe('shouldRetry', () => {
    it('returns false when max retries exceeded', () => {
      const error: ApiError = {
        message: 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      };
      expect(ApiErrorHandler.shouldRetry(error, 3, 3)).toBe(false);
    });

    it('returns true for network errors within retry limit', () => {
      const error: ApiError = {
        message: 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      };
      expect(ApiErrorHandler.shouldRetry(error, 0, 3)).toBe(true);
    });

    it('returns true for 5xx server errors', () => {
      const error: ApiError = {
        message: 'Server error',
        status: 500,
      };
      expect(ApiErrorHandler.shouldRetry(error, 0, 3)).toBe(true);
    });

    it('returns false for 4xx client errors', () => {
      const error: ApiError = {
        message: 'Bad request',
        status: 400,
      };
      expect(ApiErrorHandler.shouldRetry(error, 0, 3)).toBe(false);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('returns custom message for 401', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        status: 401,
      };
      const message = ApiErrorHandler.getUserFriendlyMessage(error);
      expect(message).toContain('authenticated');
    });

    it('returns custom message for 403', () => {
      const error: ApiError = {
        message: 'Forbidden',
        status: 403,
      };
      const message = ApiErrorHandler.getUserFriendlyMessage(error);
      expect(message).toContain('permission');
    });

    it('returns custom message for 404', () => {
      const error: ApiError = {
        message: 'Not found',
        status: 404,
      };
      const message = ApiErrorHandler.getUserFriendlyMessage(error);
      expect(message).toContain('not found');
    });

    it('returns custom message for 500', () => {
      const error: ApiError = {
        message: 'Internal server error',
        status: 500,
      };
      const message = ApiErrorHandler.getUserFriendlyMessage(error);
      expect(message).toContain('Server error');
    });

    it('falls back to error message when no specific handler', () => {
      const error: ApiError = {
        message: 'Custom error message',
        status: 999,
      };
      const message = ApiErrorHandler.getUserFriendlyMessage(error);
      expect(message).toContain('Custom error message');
    });
  });

  describe('createErrorNotification', () => {
    it('creates warning notification for auth errors', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        status: 401,
      };
      const notification = ApiErrorHandler.createErrorNotification(error);
      expect(notification.type).toBe('warning');
      expect(notification.title).toBe('Authentication Required');
    });

    it('creates error notification for other errors', () => {
      const error: ApiError = {
        message: 'Server error',
        status: 500,
      };
      const notification = ApiErrorHandler.createErrorNotification(error);
      expect(notification.type).toBe('error');
      expect(notification.title).toBe('Error');
    });
  });
});
