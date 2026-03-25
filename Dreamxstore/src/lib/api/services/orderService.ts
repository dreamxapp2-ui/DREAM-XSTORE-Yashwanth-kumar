/**
 * Order Service - User order related API calls
 */

import { apiClient } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    brandName?: string;
  } | null;
  title: string;
  category: string;
  size?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  userId: string;
  brandId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  paymentId?: string;
  shippingStatus: 'pending' | 'confirmed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  shippingAddressSnapshot: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  shippingId?: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalSpend: number;
  statusBreakdown: {
    [key: string]: number;
  };
  recentOrders: Order[];
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface OrderStatsResponse {
  success: boolean;
  data: OrderStats;
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

class UserOrderService {
  /**
   * Get user's order history
   */
  static async getOrders(page = 1, limit = 10, status?: string): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const token = localStorage.getItem('token');
      // Fix: the NEXT_PUBLIC_API_URL already contains '/api', so the correct route is just '/user/orders'
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/user/orders?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[UserOrderService] Get orders error:', error);
      throw error;
    }
  }

  /**
   * Get user's order statistics
   */
  static async getOrderStats(): Promise<OrderStatsResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/user/orders/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[UserOrderService] Get order stats error:', error);
      throw error;
    }
  }

  /**
   * Get specific order details
   */
  static async getOrderDetails(orderId: string): Promise<OrderDetailResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/user/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[UserOrderService] Get order details error:', error);
      throw error;
    }
  }

  /**
   * Format order status for display
   */
  static formatOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  }

  /**
   * Get status color
   */
  static getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      shipped: 'text-purple-600 bg-purple-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export default UserOrderService;
