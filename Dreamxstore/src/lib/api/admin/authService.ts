/**
 * Admin Authentication Service
 * Handles superadmin login and token management
 */

import { apiClient } from '../client';
import { TokenManager } from '../tokenManager';
import type { User } from '../types';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'superadmin';
    firstName?: string;
    lastName?: string;
  };
}

export class AdminAuthService {
  /**
   * Admin login - authenticate with email and password
   * This endpoint checks if user is admin/superadmin
   */
  static async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>(
        '/admin/login',
        credentials,
        { skipAuth: true } // Don't need auth token for login
      );

      // Store token and user data
      if (response.token) {
        TokenManager.setTokens({ token: response.token });
        TokenManager.setUser(response.user as User, response.token);
      }

      return response;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  /**
   * Get current admin user
   */
  static getCurrentUser(): User | null {
    return TokenManager.getUser();
  }

  /**
   * Check if current user is authenticated as admin
   */
  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user && (user.role === 'admin' || user.role === 'superadmin');
  }

  /**
   * Check if current user is superadmin
   */
  static isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'superadmin';
  }

  /**
   * Logout admin user
   */
  static logout(): void {
    TokenManager.logout();
  }

  /**
   * Get admin token
   */
  static getToken(): string | null {
    return TokenManager.getToken();
  }

  /**
   * Change admin password
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.post('/admin/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Get admin profile
   */
  static async getProfile(): Promise<any> {
    return await apiClient.get('/admin/profile');
  }

  /**
   * Update admin profile
   */
  static async updateProfile(data: any): Promise<any> {
    return await apiClient.put('/admin/profile', data);
  }
}

export default AdminAuthService;
