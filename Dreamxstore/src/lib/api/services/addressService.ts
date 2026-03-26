/**
 * Address Service - Address management API calls
 */

import { apiClient } from '../client';

export interface Address {
  _id?: string;
  type: 'shipping' | 'billing';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface AddAddressData {
  type?: 'shipping' | 'billing';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  type?: 'shipping' | 'billing';
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

class AddressService {
  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<Address[]> {
    try {
      console.log('[AddressService] Fetching addresses...');
      const response = await apiClient.get('/user/addresses');
      
      console.log('[AddressService] Addresses response:', response);
      
      if (response.success) {
        return response.data || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('[AddressService] Error fetching addresses:', error);
      throw error;
    }
  }

  /**
   * Add a new address
   */
  async addAddress(addressData: AddAddressData): Promise<Address[]> {
    try {
      console.log('[AddressService] Adding address:', addressData);
      const response = await apiClient.post('/user/addresses', addressData);
      
      console.log('[AddressService] Add address response:', response);
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.message || 'Failed to add address');
    } catch (error: any) {
      console.error('[AddressService] Error adding address:', error);
      throw error;
    }
  }

  /**
   * Update an existing address
   */
  async updateAddress(addressId: string, addressData: UpdateAddressData): Promise<Address[]> {
    try {
      console.log('[AddressService] Updating address:', addressId, addressData);
      const response = await apiClient.put(`/user/addresses/${addressId}`, addressData);
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.message || 'Failed to update address');
    } catch (error: any) {
      console.error('[AddressService] Error updating address:', error);
      throw error;
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<Address[]> {
    try {
      console.log('[AddressService] Deleting address:', addressId);
      const response = await apiClient.delete(`/user/addresses/${addressId}`);
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.message || 'Failed to delete address');
    } catch (error: any) {
      console.error('[AddressService] Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId: string): Promise<Address[]> {
    try {
      console.log('[AddressService] Setting default address:', addressId);
      const response = await apiClient.put(`/user/addresses/${addressId}/default`, {});
      
      if (response.success) {
        return response.data || [];
      }
      
      throw new Error(response.message || 'Failed to set default address');
    } catch (error: any) {
      console.error('[AddressService] Error setting default address:', error);
      throw error;
    }
  }
}

export default new AddressService();
