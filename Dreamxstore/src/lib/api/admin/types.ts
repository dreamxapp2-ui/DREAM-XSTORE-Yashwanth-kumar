// Admin Panel Types

export interface DashboardStats {
  totalUsers: number;
  totalBrands: number;
  totalOrders: number;
  totalRevenue: number;
  revenueChange: number; // Percentage change
  ordersChange: number;
  usersChange: number;
  brandsChange: number;
}

export interface RecentOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface RecentBrand {
  id: string;
  name: string;
  ownerEmail: string;
  status: BrandStatus;
  createdAt: string;
}

// Brand Management
export enum BrandStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  ownerEmail: string;
  ownerId: string;
  productCount: number;
  location: string;
  status: BrandStatus;
  commissionRate: number; // Platform commission percentage
  totalSales: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CreateBrandData {
  name: string;
  description: string;
  ownerEmail: string;
  location: string;
  commissionRate?: number;
}

// Customer Management
export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  INACTIVE = 'inactive',
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  isBrand: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  lastLogin?: string;
}

// Product Management
export enum ProductStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REJECTED = 'rejected',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  brandId: string;
  brandName: string;
  category: string;
  images: string[];
  stock: number;
  status: ProductStatus;
  featured: boolean;
  sales: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  parent?: string;
  createdAt: string;
}

// Order Management
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  brandId: string;
  brandName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  platformCommission: number;
  brandPayout: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: any;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Finance & Payouts
export interface Transaction {
  id: string;
  orderId: string;
  brandId: string;
  brandName: string;
  amount: number;
  platformCommission: number;
  brandPayout: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface BrandPayout {
  brandId: string;
  brandName: string;
  totalSales: number;
  platformCommission: number;
  amountOwed: number;
  lastPayoutDate?: string;
  lastPayoutAmount?: number;
  pendingOrders: number;
}

export interface PayoutRecord {
  id: string;
  brandId: string;
  brandName: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

// Analytics
export interface SalesAnalytics {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  customers: number;
}

export interface TopProduct {
  id: string;
  name: string;
  brandName: string;
  sales: number;
  revenue: number;
  image?: string;
}

export interface TopBrand {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  productCount: number;
  logo?: string;
}

export interface AnalyticsData {
  salesOverTime: SalesAnalytics[];
  topProducts: TopProduct[];
  topBrands: TopBrand[];
  conversionRate: number;
  newCustomers: number;
  returningCustomers: number;
}

// Content Management
export interface Banner {
  id: string;
  _id?: string;
  title: string;
  buttonText: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  brandId?: string; // null for platform-wide
  brandName?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Commission Settings
export interface CommissionSettings {
  defaultRate: number; // Default commission percentage
  categoryRates?: Record<string, number>; // Category-specific rates
  brandRates?: Record<string, number>; // Brand-specific rates
}

// Filters
export interface BrandFilters {
  status?: BrandStatus;
  search?: string;
  location?: string;
  sortBy?: 'name' | 'createdAt' | 'totalSales' | 'productCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerFilters {
  status?: UserStatus;
  search?: string;
  sortBy?: 'name' | 'totalSpent' | 'totalOrders' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  brandId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'createdAt' | 'total';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  status?: ProductStatus;
  brandId?: string;
  category?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'sales' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
