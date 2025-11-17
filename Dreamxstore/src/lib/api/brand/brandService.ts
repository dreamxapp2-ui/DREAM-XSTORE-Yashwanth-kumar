/**
 * Brand Service
 * Handles brand-specific operations including product creation
 */

import { apiClient } from '../client';

export interface BrandProductData {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  sizeStock: { [key: string]: number };
  sizes: string[];
  features: string[];
  tags: string[];
  images: string[];
  hasSizes: boolean;
}

export class BrandService {
  /**
   * Upload product images for brand
   */
  static async uploadProductImages(files: File[], onProgress?: (progress: number) => void): Promise<{ url: string; publicId: string }[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await apiClient.upload<any>(
      '/upload/brand-product',
      formData,
      onProgress
    );
    
    console.log('[BrandService.uploadProductImages] Raw response:', response);
    console.log('[BrandService.uploadProductImages] Response type:', typeof response);
    console.log('[BrandService.uploadProductImages] Is array:', Array.isArray(response));
    
    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if ((response as any)?.success && response?.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    console.warn('[BrandService.uploadProductImages] Unexpected response format:', response);
    return [];
  }

  /**
   * Create a new product for the brand
   */
  static async createProduct(data: BrandProductData): Promise<any> {
    return await apiClient.post<any>('/brand/products', data);
  }
}
