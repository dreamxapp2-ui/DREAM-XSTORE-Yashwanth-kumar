/**
 * Brand Authentication Service
 * Handles brand login and token management
 */

import { apiClient } from '../client';
import { TokenManager } from '../tokenManager';

export interface BrandLoginRequest {
  brandName: string;
  ownerEmail: string;
  password: string;
}

export interface BrandLoginResponse {
  success: boolean;
  message: string;
  token: string;
  brand: {
    id: string;
    brandName: string;
    ownerEmail: string;
    status: string;
    profileImage?: {
      url?: string;
      publicId?: string;
    };
  };
}

export interface BrandUser {
  id: string;
  brandName: string;
  ownerEmail: string;
  status: string;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
  description?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  token?: string;
}

export class BrandAuthService {
  /**
   * Brand login - authenticate with brand name, owner email, and password
   */
  static async login(credentials: BrandLoginRequest): Promise<BrandLoginResponse> {
    try {
      const response = await apiClient.post<BrandLoginResponse>(
        '/admin/brand-login',
        credentials,
        { skipAuth: true } // Don't need auth token for login
      );

      // Store token and brand data
      if (response.token) {
        TokenManager.setTokens({ token: response.token });
        // Store brand-specific user data
        localStorage.setItem('brand_user', JSON.stringify({
          id: response.brand.id,
          brandName: response.brand.brandName,
          ownerEmail: response.brand.ownerEmail,
          status: response.brand.status,
          profileImage: response.brand.profileImage,
          token: response.token
        }));
      }

      return response;
    } catch (error) {
      console.error('Brand login failed:', error);
      throw error;
    }
  }

  /**
   * Get current brand user from localStorage
   */
  static getCurrentBrand(): BrandUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const brandData = localStorage.getItem('brand_user');
      if (brandData) {
        return JSON.parse(brandData);
      }
    } catch (error) {
      console.error('Error parsing brand user:', error);
    }
    return null;
  }

  /**
   * Fetch current brand profile from backend
   */
  static async getBrandProfile(): Promise<BrandUser | null> {
    try {
      console.log('[getBrandProfile] Fetching fresh profile from backend');
      const response = await apiClient.get<any>('/brand/profile');
      
      console.log('[getBrandProfile] Raw response:', response);
      console.log('[getBrandProfile] Response type:', typeof response);
      console.log('[getBrandProfile] Has profileImage:', !!response?.profileImage);
      
      // apiClient.get() already extracts the data, so response IS the brand object
      if (response && response.id) {
        const brandData = response;
        
        // Update localStorage with fresh data
        const currentBrand = this.getCurrentBrand();
        if (currentBrand) {
          const updatedBrand = {
            id: brandData.id || currentBrand.id,
            brandName: brandData.brandName || currentBrand.brandName,
            ownerEmail: brandData.ownerEmail || currentBrand.ownerEmail,
            status: brandData.status || currentBrand.status,
            profileImage: brandData.profileImage || currentBrand.profileImage,
            description: brandData.description || currentBrand.description,
            instagram: brandData.instagram || currentBrand.instagram,
            facebook: brandData.facebook || currentBrand.facebook,
            twitter: brandData.twitter || currentBrand.twitter,
            token: currentBrand.token
          };
          
          console.log('[getBrandProfile] Updated brand with profileImage:', {
            url: updatedBrand.profileImage?.url || 'N/A',
            publicId: updatedBrand.profileImage?.publicId || 'N/A'
          });
          
          localStorage.setItem('brand_user', JSON.stringify(updatedBrand));
          return updatedBrand;
        }
      }
    } catch (error) {
      console.error('[getBrandProfile] Error fetching brand profile:', error);
    }
    return this.getCurrentBrand();
  }

  /**
   * Check if brand is logged in
   */
  static isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('brand_user') && !!localStorage.getItem('token');
  }

  /**
   * Logout brand user
   */
  static logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('brand_user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('storage'));
  }

  /**
   * Get brand token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Update brand profile
   */
  static async updateProfile(data: FormData | { 
    description?: string; 
    instagram?: string; 
    facebook?: string; 
    twitter?: string;
    profileImage?: { url: string; publicId: string };
  }): Promise<any> {
    try {
      if (data instanceof FormData) {
        // For FormData, use POST to upload endpoint
        console.log('[BrandAuthService.updateProfile] Sending FormData');
        console.log('[BrandAuthService.updateProfile] Brand token:', localStorage.getItem('brand_user') ? 'EXISTS' : 'MISSING');
        
        const response = await apiClient.upload<any>('/brand/profile/upload', data);
        
        console.log('[BrandAuthService.updateProfile] Response received:', {
          type: typeof response,
          isArray: Array.isArray(response),
          keys: typeof response === 'object' ? Object.keys(response).slice(0, 5) : 'N/A'
        });
        
        return response;
      }
      // For JSON data, use PATCH
      console.log('[BrandAuthService.updateProfile] Sending JSON');
      return await apiClient.patch<any>('/brand/profile', data);
    } catch (error: any) {
      console.error('Brand profile update failed:', error);
      console.error('Error details:', { 
        message: error.message, 
        status: error.status,
        code: error.code,
        fullError: error 
      });
      throw error;
    }
  }
}
