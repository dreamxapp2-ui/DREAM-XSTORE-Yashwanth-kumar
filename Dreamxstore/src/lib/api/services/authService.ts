// Auth Service - Authentication related API calls
import { apiClient } from '../client';
import { TokenManager } from '../tokenManager';
import { ENDPOINTS } from '../config';
import type { AuthResponse, User } from '../types';

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.LOGIN,
      { email, password },
      { skipAuth: true }
    );

    // Save tokens and user data
    if (response.token) {
      TokenManager.setTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
      TokenManager.setUser(response.user, response.token);
    }

    return response;
  }

  /**
   * Signup with user details
   */
  static async signup(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.SIGNUP,
      userData,
      { skipAuth: true }
    );

    // Save tokens and user data
    if (response.token) {
      TokenManager.setTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
      TokenManager.setUser(response.user, response.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      TokenManager.logout();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(ENDPOINTS.USER_PROFILE);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  /**
   * Get stored user data (without API call)
   */
  static getStoredUser(): User | null {
    return TokenManager.getUser();
  }

  /**
   * Google OAuth login
   */
  static initiateGoogleLogin(): void {
    window.location.href = `${apiClient.getAxiosInstance().defaults.baseURL}${ENDPOINTS.GOOGLE_AUTH}`;
  }

  /**
   * Handle OAuth callback (called from redirect URL)
   */
  static handleOAuthCallback(token: string, user: User): void {
    TokenManager.setTokens({ token });
    TokenManager.setUser(user, token);
  }
}

export default AuthService;
