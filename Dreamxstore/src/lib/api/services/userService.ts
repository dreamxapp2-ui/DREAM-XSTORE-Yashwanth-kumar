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
    const user = await apiClient.get<User>(ENDPOINTS.USER_PROFILE);
    TokenManager.setUser(user);
    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<User> {
    const user = await apiClient.put<User>(ENDPOINTS.UPDATE_PROFILE, data);
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
   * Upload profile picture
   */
  static async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return await apiClient.upload<{ url: string }>(
      '/user/upload-avatar',
      formData
    );
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
}

export default UserService;
