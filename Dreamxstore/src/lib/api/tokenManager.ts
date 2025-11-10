// Token Manager - Handles token storage and refresh
import { TOKEN_CONFIG } from './config';
import type { AuthTokens, User } from './types';

export class TokenManager {
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * Get auth token from localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get token from direct storage
    const directToken = localStorage.getItem(TOKEN_CONFIG.tokenKey);
    if (directToken) return directToken;
    
    // Try to get from user object (legacy support)
    try {
      const userStr = localStorage.getItem(TOKEN_CONFIG.userKey);
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.token || null;
      }
    } catch (e) {
      console.error('Error parsing user object:', e);
    }
    
    return null;
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_CONFIG.refreshTokenKey);
  }

  /**
   * Set auth tokens in localStorage
   */
  static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(TOKEN_CONFIG.tokenKey, tokens.token);
    
    if (tokens.refreshToken) {
      localStorage.setItem(TOKEN_CONFIG.refreshTokenKey, tokens.refreshToken);
    }
  }

  /**
   * Clear all auth tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(TOKEN_CONFIG.tokenKey);
    localStorage.removeItem(TOKEN_CONFIG.refreshTokenKey);
  }

  /**
   * Save user data to localStorage
   */
  static setUser(user: User, token?: string): void {
    if (typeof window === 'undefined') return;
    
    const userData = { ...user, token };
    localStorage.setItem(TOKEN_CONFIG.userKey, JSON.stringify(userData));
    
    if (token) {
      localStorage.setItem(TOKEN_CONFIG.tokenKey, token);
    }
  }

  /**
   * Get user data from localStorage
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem(TOKEN_CONFIG.userKey);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      delete user.token; // Remove token from user object
      return user;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  /**
   * Clear user data
   */
  static clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_CONFIG.userKey);
  }

  /**
   * Complete logout - clear all auth data
   */
  static logout(): void {
    this.clearTokens();
    this.clearUser();
    this.refreshPromise = null;
  }

  /**
   * Check if token is expired (basic JWT decode)
   */
  static isTokenExpired(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return true;
    
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const exp = payload.exp;
      
      if (!exp) return false;
      
      // Check if token expires in less than 5 minutes
      const expirationTime = exp * 1000;
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      
      return expirationTime - currentTime < bufferTime;
    } catch (e) {
      console.error('Error decoding token:', e);
      return true;
    }
  }

  /**
   * Refresh token handler (to be called by API client)
   * Returns a promise that resolves to the new token
   */
  static async refreshToken(
    refreshFn: () => Promise<AuthTokens>
  ): Promise<string | null> {
    // If already refreshing, return existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
          this.logout();
          return null;
        }

        const tokens = await refreshFn();
        this.setTokens(tokens);
        
        return tokens.token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.logout();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }
}

export default TokenManager;
