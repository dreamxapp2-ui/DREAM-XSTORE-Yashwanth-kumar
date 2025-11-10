// Order Service - Order related API calls
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import type { PaginatedResponse } from '../types';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingDetails?: any;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  couponCode?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingDetails?: any;
  paymentMethod: string;
  couponCode?: string;
}

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    return await apiClient.post<Order>(ENDPOINTS.CREATE_ORDER, orderData);
  }

  /**
   * Get all orders for current user
   */
  static async getOrders(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    return await apiClient.get<PaginatedResponse<Order>>(
      `${ENDPOINTS.ORDERS}?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<Order> {
    return await apiClient.get<Order>(ENDPOINTS.ORDER_BY_ID(orderId));
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string): Promise<Order> {
    return await apiClient.patch<Order>(ENDPOINTS.ORDER_BY_ID(orderId), {
      orderStatus: 'cancelled',
    });
  }

  /**
   * Download order invoice
   */
  static async downloadInvoice(orderId: string): Promise<void> {
    await apiClient.download(
      ENDPOINTS.DOWNLOAD_INVOICE(orderId),
      `invoice_${orderId}.pdf`
    );
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  }> {
    return await apiClient.get('/orders/stats');
  }
}

export default OrderService;
