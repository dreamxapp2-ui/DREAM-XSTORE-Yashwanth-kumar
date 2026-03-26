// Admin Service - Comprehensive admin panel API calls
import { apiClient } from '../client';
import type { PaginatedResponse } from '../types';
import type {
  DashboardStats,
  RecentOrder,
  RecentBrand,
  Brand,
  CreateBrandData,
  BrandFilters,
  Customer,
  CustomerFilters,
  AdminProduct,
  ProductFilters,
  Category,
  AdminOrder,
  OrderFilters,
  Transaction,
  BrandPayout,
  PayoutRecord,
  RefundRequest,
  AnalyticsData,
  Banner,
  Coupon,
  CommissionSettings,
  BrandStatus,
  ProductStatus,
  OrderStatus,
  UserStatus,
} from './types';
import { AuditLog } from '../rbac/types';

export class AdminService {
  // ==================== Dashboard ====================
  
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    return await apiClient.get<DashboardStats>('/admin/dashboard/stats');
  }

  /**
   * Get recent orders for dashboard
   */
  static async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    return await apiClient.get<RecentOrder[]>(`/admin/dashboard/recent-orders?limit=${limit}`);
  }

  /**
   * Get recent brands for dashboard
   */
  static async getRecentBrands(limit: number = 5): Promise<RecentBrand[]> {
    return await apiClient.get<RecentBrand[]>(`/admin/dashboard/recent-brands?limit=${limit}`);
  }

  // ==================== Brand Management ====================
  
  /**
   * Get all brands with filters
   */
  static async getBrands(filters?: BrandFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    // apiClient.get will return the extracted data from response.data.data
    // For paginated responses, this returns the whole response object { data: [...], pagination: {...} }
    return await apiClient.get<any>(
      `/admin/brands?${params.toString()}`
    );
  }

  /**
   * Get all brands using public endpoint (no auth required)
   */
  static async getPublicBrands(filters?: BrandFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return await apiClient.get<any>(
      `/admin/public/brands?${params.toString()}`
    );
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(id: string): Promise<Brand> {
    return await apiClient.get<Brand>(`/admin/brands/${id}`);
  }

  /**
   * Create new brand
   */
  static async createBrand(data: CreateBrandData): Promise<Brand> {
    return await apiClient.post<Brand>('/admin/brands', data);
  }

  /**
   * Update brand
   */
  static async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    return await apiClient.put<Brand>(`/admin/brands/${id}`, data);
  }

  /**
   * Update brand profile (description, profile image, social links, etc.)
   */
  static async updateBrandProfile(id: string, data: FormData | { 
    description?: string; 
    instagram?: string; 
    facebook?: string; 
    twitter?: string;
    profileImage?: { url: string; publicId: string };
  }): Promise<Brand> {
    if (data instanceof FormData) {
      // For FormData, use POST to /upload endpoint which handles multipart/form-data
      return await apiClient.upload<Brand>(`/admin/brands/${id}/upload`, data);
    }
    return await apiClient.patch<Brand>(`/admin/brands/${id}`, data);
  }

  /**
   * Upload brand images to Cloudinary
   */
  static async uploadBrandImages(files: File[], onProgress?: (progress: number) => void): Promise<{ url: string; publicId: string }[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('image', file);
    });
    const response = await apiClient.upload<any>(
      '/upload/brand',
      formData,
      onProgress
    );
    
    console.log('[uploadBrandImages] Raw response:', response);
    
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
   * Delete brand
   */
  static async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/admin/brands/${id}`);
  }

  /**
   * Approve brand
   */
  static async approveBrand(id: string): Promise<Brand> {
    return await apiClient.post<Brand>(`/admin/brands/${id}/approve`);
  }

  /**
   * Reject brand
   */
  static async rejectBrand(id: string, reason: string): Promise<Brand> {
    return await apiClient.post<Brand>(`/admin/brands/${id}/reject`, { reason });
  }

  /**
   * Update brand status
   */
  static async updateBrandStatus(id: string, status: BrandStatus): Promise<Brand> {
    return await apiClient.patch<Brand>(`/admin/brands/${id}/status`, { status });
  }

  // ==================== Customer Management ====================
  
  /**
   * Get all customers with filters
   */
  static async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return await apiClient.get<PaginatedResponse<Customer>>(
      `/admin/customers?${params.toString()}`
    );
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(id: string): Promise<Customer> {
    return await apiClient.get<Customer>(`/admin/customers/${id}`);
  }

  /**
   * Get customer order history
   */
  static async getCustomerOrders(customerId: string): Promise<AdminOrder[]> {
    return await apiClient.get<AdminOrder[]>(`/admin/customers/${customerId}/orders`);
  }

  /**
   * Update customer
   */
  static async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return await apiClient.put<Customer>(`/admin/customers/${id}`, data);
  }

  /**
   * Ban/unban customer
   */
  static async updateCustomerStatus(id: string, status: UserStatus): Promise<Customer> {
    return await apiClient.patch<Customer>(`/admin/customers/${id}/status`, { status });
  }

  /**
   * Make a customer a brand
   */
  static async makeCustomerBrand(id: string): Promise<Customer> {
    return await apiClient.patch<Customer>(`/admin/customers/${id}/brand`, {});
  }

  /**
   * Revoke brand status from a customer
   */
  static async revokeBrandStatus(id: string): Promise<Customer> {
    return await apiClient.patch<Customer>(`/admin/customers/${id}/revoke-brand`, {});
  }



  // ==================== Product Management ====================
  
  /**
   * Upload product images to Cloudinary
   */
  static async uploadProductImages(files: File[], onProgress?: (progress: number) => void): Promise<{ url: string; publicId: string }[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await apiClient.upload<{ data: { url: string; publicId: string }[] }>(
      '/upload/product',
      formData,
      onProgress
    );
    return Array.isArray(response) ? response : (response.data || []);
  }

  /**
   * Create new product
   */
  static async addProduct(data: any): Promise<any> {
    return await apiClient.post<any>('/admin/products', data);
  }

  /**
   * Get all products with filters
   */
  static async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<AdminProduct>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return await apiClient.get<PaginatedResponse<AdminProduct>>(
      `/admin/products?${params.toString()}`
    );
  }

  /**
   * Get pending products for approval
   */
  static async getPendingProducts(): Promise<AdminProduct[]> {
    return await apiClient.get<AdminProduct[]>('/admin/products/pending');
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<AdminProduct> {
    return await apiClient.get<AdminProduct>(`/admin/products/${id}`);
  }

  /**
   * Approve product
   */
  static async approveProduct(id: string): Promise<AdminProduct> {
    return await apiClient.post<AdminProduct>(`/admin/products/${id}/approve`);
  }

  /**
   * Reject product
   */
  static async rejectProduct(id: string, reason: string): Promise<AdminProduct> {
    return await apiClient.post<AdminProduct>(`/admin/products/${id}/reject`, { reason });
  }

  /**
   * Update product status
   */
  static async updateProductStatus(id: string, status: ProductStatus): Promise<AdminProduct> {
    return await apiClient.patch<AdminProduct>(`/admin/products/${id}/status`, { status });
  }

  /**
   * Toggle featured status
   */
  static async toggleFeaturedProduct(id: string, featured: boolean): Promise<AdminProduct> {
    return await apiClient.patch<AdminProduct>(`/admin/products/${id}/featured`, { featured });
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
    return await apiClient.put<AdminProduct>(`/admin/products/${id}`, data);
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  }

  // ==================== Category Management ====================
  
  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    return await apiClient.get<Category[]>('/admin/categories');
  }

  /**
   * Create category
   */
  static async createCategory(data: Omit<Category, 'id' | 'productCount' | 'createdAt'>): Promise<Category> {
    return await apiClient.post<Category>('/admin/categories', data);
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return await apiClient.put<Category>(`/admin/categories/${id}`, data);
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`);
  }

  // ==================== Order Management ====================
  
  /**
   * Get all orders with filters
   */
  static async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<AdminOrder>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return await apiClient.get<PaginatedResponse<AdminOrder>>(
      `/admin/orders?${params.toString()}`
    );
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<AdminOrder> {
    return await apiClient.get<AdminOrder>(`/admin/orders/${id}`);
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    return await apiClient.patch<AdminOrder>(`/admin/orders/${id}/status`, { status });
  }

  /**
   * Update order tracking
   */
  static async updateOrderTracking(id: string, trackingNumber: string): Promise<AdminOrder> {
    return await apiClient.patch<AdminOrder>(`/admin/orders/${id}/tracking`, { trackingNumber });
  }

  /**
   * Cancel order
   */
  static async cancelOrder(id: string, reason: string): Promise<AdminOrder> {
    return await apiClient.post<AdminOrder>(`/admin/orders/${id}/cancel`, { reason });
  }

  // ==================== Finance & Payouts ====================
  
  /**
   * Get all transactions
   */
  static async getTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    return await apiClient.get<PaginatedResponse<Transaction>>(
      `/admin/finance/transactions?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get brand payouts summary
   */
  static async getBrandPayouts(): Promise<BrandPayout[]> {
    return await apiClient.get<BrandPayout[]>('/admin/finance/payouts');
  }

  /**
   * Get payout history
   */
  static async getPayoutHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<PayoutRecord>> {
    return await apiClient.get<PaginatedResponse<PayoutRecord>>(
      `/admin/finance/payout-history?page=${page}&limit=${limit}`
    );
  }

  /**
   * Create payout for brand
   */
  static async createPayout(brandId: string, amount: number): Promise<PayoutRecord> {
    return await apiClient.post<PayoutRecord>('/admin/finance/payouts', {
      brandId,
      amount,
    });
  }

  /**
   * Get refund requests
   */
  static async getRefundRequests(
    status?: string
  ): Promise<RefundRequest[]> {
    const params = status ? `?status=${status}` : '';
    return await apiClient.get<RefundRequest[]>(`/admin/finance/refunds${params}`);
  }

  /**
   * Process refund
   */
  static async processRefund(
    refundId: string,
    approved: boolean,
    note?: string
  ): Promise<RefundRequest> {
    return await apiClient.post<RefundRequest>(`/admin/finance/refunds/${refundId}/process`, {
      approved,
      note,
    });
  }

  /**
   * Get commission settings
   */
  static async getCommissionSettings(): Promise<CommissionSettings> {
    return await apiClient.get<CommissionSettings>('/admin/finance/commission-settings');
  }

  /**
   * Update commission settings
   */
  static async updateCommissionSettings(settings: CommissionSettings): Promise<CommissionSettings> {
    return await apiClient.put<CommissionSettings>('/admin/finance/commission-settings', settings);
  }

  // ==================== Analytics ====================
  
  /**
   * Get analytics data
   */
  static async getAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiClient.get<AnalyticsData>(
      `/admin/analytics?${params.toString()}`
    );
  }

  /**
   * Export analytics report
   */
  static async exportReport(format: 'csv' | 'pdf', startDate?: string, endDate?: string): Promise<void> {
    const params = new URLSearchParams({ format });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    await apiClient.download(
      `/admin/analytics/export?${params.toString()}`,
      `report_${Date.now()}.${format}`
    );
  }

  // ==================== Content Management ====================
  
  /**
   * Get all banners
   */
  static async getBanners(): Promise<Banner[]> {
    return await apiClient.get<Banner[]>('/admin/banners');
  }

  /**
   * Create banner
   */
  static async createBanner(data: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Banner> {
    return await apiClient.post<Banner>('/admin/banners', data);
  }

  /**
   * Update banner
   */
  static async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    return await apiClient.put<Banner>(`/admin/banners/${id}`, data);
  }

  /**
   * Delete banner
   */
  static async deleteBanner(id: string): Promise<void> {
    await apiClient.delete(`/admin/banners/${id}`);
  }

  /**
   * Toggle banner status
   */
  static async toggleBanner(id: string): Promise<Banner> {
    return await apiClient.put<Banner>(`/admin/banners/${id}/toggle`);
  }

  /**
   * Upload banner image
   */
  static async uploadBannerImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return await apiClient.upload<{ url: string }>('/admin/banners/upload', formData);
  }

  /**
   * Get all coupons
   */
  static async getCoupons(): Promise<Coupon[]> {
    return await apiClient.get<Coupon[]>('/admin/content/coupons');
  }

  /**
   * Create coupon
   */
  static async createCoupon(data: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>): Promise<Coupon> {
    return await apiClient.post<Coupon>('/admin/content/coupons', data);
  }

  /**
   * Update coupon
   */
  static async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    return await apiClient.put<Coupon>(`/admin/content/coupons/${id}`, data);
  }

  /**
   * Delete coupon
   */
  static async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/admin/content/coupons/${id}`);
  }

  // ==================== Audit Logs ====================
  
  /**
   * Get audit logs
   */
  static async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    userId?: string,
    action?: string
  ): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (userId) params.append('userId', userId);
    if (action) params.append('action', action);
    
    return await apiClient.get<PaginatedResponse<AuditLog>>(
      `/admin/audit-logs?${params.toString()}`
    );
  }

  /**
   * Export audit logs
   */
  static async exportAuditLogs(startDate?: string, endDate?: string): Promise<void> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    await apiClient.download(
      `/admin/audit-logs/export?${params.toString()}`,
      `audit_logs_${Date.now()}.csv`
    );
  }

  // ==================== Settings ====================

  /**
   * Get platform settings
   */
  static async getSettings(): Promise<any> {
    return await apiClient.get('/admin/settings');
  }

  /**
   * Update platform settings
   */
  static async updateSettings(settings: any): Promise<any> {
    return await apiClient.put('/admin/settings', settings);
  }
}

export default AdminService;
