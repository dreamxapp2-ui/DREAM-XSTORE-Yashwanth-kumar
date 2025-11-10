// Product Service - Product related API calls
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import type { PaginatedResponse } from '../types';

export interface Product {
  _id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  subCategory?: string;
  images: string[];
  thumbnails?: string[];
  sizes: string[];
  stock?: number;
  stockQuantity?: number;
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  tags?: string[];
  brand?: any;
  brandId?: string;
  brandName?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  /**
   * Get all products with optional filters
   */
  static async getProducts(
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return await apiClient.get<PaginatedResponse<Product>>(
      `${ENDPOINTS.PRODUCTS}?${params.toString()}`
    );
  }

  /**
   * Get product by ID (public endpoint - no auth required)
   */
  static async getProductById(id: string): Promise<Product> {
    return await apiClient.get<Product>(ENDPOINTS.PRODUCT_BY_ID(id));
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.getProducts({ featured: true, limit });
    return response.data;
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    return await this.getProducts({ ...filters, search: query });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Product>> {
    return await this.getProducts({ category, page, limit });
  }
}

export default ProductService;
