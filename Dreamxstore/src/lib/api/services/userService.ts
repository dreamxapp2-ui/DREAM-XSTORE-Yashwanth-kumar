// User Service - User profile and data management API calls
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { TokenManager } from '../tokenManager';
import type { User } from '../types';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  username?: string;
  bio?: string;
  hero_image?: {
    url: string;
    publicId: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<any>(ENDPOINTS.USER_PROFILE);
    const user = response?.user || response;

    TokenManager.setUser(user);
    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<User> {
    const user = await apiClient.put<User>('/user/profile', data);
    TokenManager.setUser(user);
    return user;
  }

  /**
   * Change password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.post('/user/change-password', data);
  }

  /**
   * Upload profile images to Cloudinary
   */
  static async uploadProfileImage(files: File[], onProgress?: (progress: number) => void): Promise<{ url: string; publicId: string }[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('image', file);
    });
    
    const response = await apiClient.upload<any>(
      '/upload/image',
      formData,
      onProgress
    );
    
    console.log('[uploadProfileImage] Raw response:', response);
    
    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    } else if (response?.data) {
      // If response has a data property, use it
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        // Single item response, wrap in array
        return [response.data];
      }
    } else if (response?.url) {
      // Direct response with url/publicId
      return [response];
    }
    
    return [];
  }

  /**
   * Get user addresses
   */
  static async getAddresses(): Promise<UserAddress[]> {
    return await apiClient.get<UserAddress[]>('/user/addresses');
  }

  /**
   * Add new address
   */
  static async addAddress(address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    return await apiClient.post<UserAddress>('/user/addresses', address);
  }

  /**
   * Update address
   */
  static async updateAddress(
    addressId: string,
    address: Partial<UserAddress>
  ): Promise<UserAddress> {
    return await apiClient.put<UserAddress>(
      `/user/addresses/${addressId}`,
      address
    );
  }

  /**
   * Delete address
   */
  static async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(`/user/addresses/${addressId}`);
  }

  /**
   * Download user data (GDPR compliance)
   */
  static async downloadUserData(): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    await apiClient.download(
      ENDPOINTS.DOWNLOAD_USER_DATA,
      `my_data_${date}.json`
    );
  }

  /**
   * Delete user account
   */
  static async deleteAccount(password: string): Promise<void> {
    await apiClient.post('/user/delete-account', { password });
    TokenManager.logout();
  }

  /**
   * Add product to wishlist
   */
  static async addToWishlist(productId: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/user/wishlist/add', { productId });
      console.log('[UserService] addToWishlist response:', response);
      return response;
    } catch (error) {
      console.error('[UserService] addToWishlist error:', error);
      throw error;
    }
  }

  /**
   * Remove product from wishlist
   */
  static async removeFromWishlist(productId: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/user/wishlist/remove', { productId });
      console.log('[UserService] removeFromWishlist response:', response);
      return response;
    } catch (error) {
      console.error('[UserService] removeFromWishlist error:', error);
      throw error;
    }
  }

  /**
   * Get user's wishlist
   */
  static async getWishlist(page: number = 1, limit: number = 20): Promise<any> {
    return await apiClient.get<any>(`/user/wishlist?page=${page}&limit=${limit}`);
  }
}

export default UserService;
