// API Client - Main export file
export { apiClient } from './client';
export { TokenManager } from './tokenManager';
export { ApiErrorHandler } from './errorHandler';
export { API_CONFIG, ENDPOINTS } from './config';

// Services
export { AuthService } from './services/authService';
export { ProductService } from './services/productService';
export { OrderService } from './services/orderService';
export { UserService } from './services/userService';

// Admin & RBAC
export * from './admin';
export * from './rbac';

// Types
export type {
  ApiError,
  ApiResponse,
  PaginatedResponse,
  RetryConfig,
  RequestConfig,
  AuthTokens,
  User,
  AuthResponse,
} from './types';

export type { Product, ProductFilters } from './services/productService';
export type {
  Order,
  OrderItem,
  ShippingAddress,
  CreateOrderData,
} from './services/orderService';
export type {
  UpdateProfileData,
  ChangePasswordData,
  UserAddress,
} from './services/userService';
