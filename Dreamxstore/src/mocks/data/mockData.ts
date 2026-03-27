// Mock Data Generators for MSW

import {
  type Brand,
  BrandStatus,
  type Customer,
  UserStatus,
  type AdminProduct,
  ProductStatus,
  type AdminOrder,
  OrderStatus,
  PaymentStatus,
  type Transaction,
  type BrandPayout,
  type PayoutRecord,
  type RefundRequest,
  type Category,
  type Banner,
  type Coupon,
  type DashboardStats,
} from '../../lib/api/admin/types';
import { UserRole, type AdminUser, type AuditLog } from '../../lib/api/rbac/types';

// ==================== Brands ====================
export const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'StyleCraft',
    description: 'Premium fashion brand specializing in modern streetwear',
    logo: 'https://placehold.co/150/FF6B6B/FFFFFF?text=SC',
    ownerEmail: 'owner@stylecraft.com',
    ownerId: 'user-brand-1',
    productCount: 24,
    location: 'Mumbai, India',
    status: BrandStatus.ACTIVE,
    commissionRate: 15,
    totalSales: 125000,
    createdAt: '2024-01-15T10:00:00Z',
    approvedAt: '2024-01-16T14:30:00Z',
    approvedBy: 'admin-1',
  },
  {
    id: 'brand-2',
    name: 'UrbanWear',
    description: 'Contemporary clothing for the modern lifestyle',
    logo: 'https://placehold.co/150/4ECDC4/FFFFFF?text=UW',
    ownerEmail: 'hello@urbanwear.com',
    ownerId: 'user-brand-2',
    productCount: 18,
    location: 'Delhi, India',
    status: BrandStatus.ACTIVE,
    commissionRate: 15,
    totalSales: 89000,
    createdAt: '2024-02-10T09:00:00Z',
    approvedAt: '2024-02-11T11:00:00Z',
    approvedBy: 'admin-1',
  },
  {
    id: 'brand-3',
    name: 'TrendHub',
    description: 'Latest fashion trends and accessories',
    logo: 'https://placehold.co/150/95E1D3/FFFFFF?text=TH',
    ownerEmail: 'contact@trendhub.com',
    ownerId: 'user-brand-3',
    productCount: 32,
    location: 'Bangalore, India',
    status: BrandStatus.PENDING,
    commissionRate: 15,
    totalSales: 0,
    createdAt: '2024-10-25T15:30:00Z',
  },
  {
    id: 'brand-4',
    name: 'EcoThreads',
    description: 'Sustainable and eco-friendly fashion',
    logo: 'https://placehold.co/150/F38181/FFFFFF?text=ET',
    ownerEmail: 'info@ecothreads.com',
    ownerId: 'user-brand-4',
    productCount: 0,
    location: 'Pune, India',
    status: BrandStatus.PENDING,
    commissionRate: 15,
    totalSales: 0,
    createdAt: '2024-10-28T12:00:00Z',
  },
  {
    id: 'brand-5',
    name: 'LuxeApparel',
    description: 'Luxury fashion and accessories',
    logo: 'https://placehold.co/150/AA96DA/FFFFFF?text=LA',
    ownerEmail: 'support@luxeapparel.com',
    ownerId: 'user-brand-5',
    productCount: 15,
    location: 'Hyderabad, India',
    status: BrandStatus.ACTIVE,
    commissionRate: 20,
    totalSales: 215000,
    createdAt: '2024-01-20T08:00:00Z',
    approvedAt: '2024-01-21T10:00:00Z',
    approvedBy: 'admin-1',
  },
];

// ==================== Customers ====================
export const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    email: 'john.doe@email.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+91 9876543210',
    avatar: 'https://i.pravatar.cc/150?u=john',
    status: UserStatus.ACTIVE,
    totalOrders: 12,
    totalSpent: 24500,
    lastOrderDate: '2024-10-28T14:30:00Z',
    isBrand: false,
    createdAt: '2024-01-01T10:00:00Z',
    lastLogin: '2024-10-30T09:00:00Z',
  },
  {
    id: 'customer-2',
    email: 'jane.smith@email.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+91 9876543211',
    avatar: 'https://i.pravatar.cc/150?u=jane',
    status: UserStatus.ACTIVE,
    totalOrders: 8,
    totalSpent: 15800,
    lastOrderDate: '2024-10-29T16:00:00Z',
    isBrand: false,
    createdAt: '2024-02-15T12:00:00Z',
    lastLogin: '2024-10-29T15:00:00Z',
  },
  {
    id: 'customer-3',
    email: 'mike.wilson@email.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    phone: '+91 9876543212',
    avatar: 'https://i.pravatar.cc/150?u=mike',
    status: UserStatus.ACTIVE,
    totalOrders: 5,
    totalSpent: 8900,
    lastOrderDate: '2024-10-26T10:00:00Z',
    isBrand: false,
    createdAt: '2024-03-20T09:00:00Z',
    lastLogin: '2024-10-28T10:00:00Z',
  },
  {
    id: 'customer-4',
    email: 'spammer@fake.com',
    firstName: 'Spam',
    lastName: 'Bot',
    phone: '+91 0000000000',
    avatar: 'https://i.pravatar.cc/150?u=spammer',
    status: UserStatus.BANNED,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: undefined,
    isBrand: false,
    createdAt: '2024-10-01T12:00:00Z',
    lastLogin: undefined,
  },
];

// ==================== Products ====================
export const mockProducts: AdminProduct[] = [
  {
    id: 'product-1',
    name: 'Classic White T-Shirt',
    description: 'Premium cotton t-shirt with a modern fit',
    price: 1299,
    brandId: 'brand-1',
    brandName: 'StyleCraft',
    category: 'T-Shirts',
    images: ['https://placehold.co/400/FF6B6B/FFFFFF?text=T-Shirt'],
    stock: 150,
    status: ProductStatus.ACTIVE,
    featured: true,
    sales: 245,
    createdAt: '2024-01-20T10:00:00Z',
    approvedAt: '2024-01-21T11:00:00Z',
    approvedBy: 'admin-1',
  },
  {
    id: 'product-2',
    name: 'Denim Jacket',
    description: 'Vintage style denim jacket',
    price: 3499,
    brandId: 'brand-2',
    brandName: 'UrbanWear',
    category: 'Jackets',
    images: ['https://placehold.co/400/4ECDC4/FFFFFF?text=Jacket'],
    stock: 45,
    status: ProductStatus.ACTIVE,
    featured: true,
    sales: 128,
    createdAt: '2024-02-15T10:00:00Z',
    approvedAt: '2024-02-16T12:00:00Z',
    approvedBy: 'admin-1',
  },
  {
    id: 'product-3',
    name: 'Summer Dress',
    description: 'Light and breezy summer dress',
    price: 2499,
    brandId: 'brand-3',
    brandName: 'TrendHub',
    category: 'Dresses',
    images: ['https://placehold.co/400/95E1D3/FFFFFF?text=Dress'],
    stock: 0,
    status: ProductStatus.PENDING,
    featured: false,
    sales: 0,
    createdAt: '2024-10-25T16:00:00Z',
  },
  {
    id: 'product-4',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with RFID protection',
    price: 1899,
    brandId: 'brand-1',
    brandName: 'StyleCraft',
    category: 'Accessories',
    images: ['https://placehold.co/400/FF6B6B/FFFFFF?text=Wallet'],
    stock: 200,
    status: ProductStatus.ACTIVE,
    featured: false,
    sales: 89,
    createdAt: '2024-03-10T10:00:00Z',
    approvedAt: '2024-03-11T11:00:00Z',
    approvedBy: 'admin-1',
  },
];

// ==================== Categories ====================
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Casual and formal t-shirts',
    productCount: 45,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Jackets',
    slug: 'jackets',
    description: 'All types of jackets',
    productCount: 28,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Dresses for all occasions',
    productCount: 32,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Fashion accessories',
    productCount: 56,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ==================== Orders ====================
export const mockOrders: AdminOrder[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    customerName: 'John Doe',
    customerEmail: 'john.doe@email.com',
    brandId: 'brand-1',
    brandName: 'StyleCraft',
    items: [
      { productId: 'product-1', productName: 'Classic White T-Shirt', quantity: 2, price: 1299 },
      { productId: 'product-4', productName: 'Leather Wallet', quantity: 1, price: 1899 },
    ],
    subtotal: 4497,
    tax: 449.7,
    shipping: 50,
    total: 4996.7,
    platformCommission: 749.5,
    brandPayout: 4247.2,
    orderStatus: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.COMPLETED,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
    },
    trackingNumber: 'TRACK123456',
    createdAt: '2024-10-20T10:00:00Z',
    updatedAt: '2024-10-25T14:00:00Z',
  },
  {
    id: 'order-2',
    customerId: 'customer-2',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@email.com',
    brandId: 'brand-2',
    brandName: 'UrbanWear',
    items: [
      { productId: 'product-2', productName: 'Denim Jacket', quantity: 1, price: 3499 },
    ],
    subtotal: 3499,
    tax: 349.9,
    shipping: 50,
    total: 3898.9,
    platformCommission: 584.8,
    brandPayout: 3314.1,
    orderStatus: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.COMPLETED,
    shippingAddress: {
      name: 'Jane Smith',
      address: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 9876543211',
    },
    trackingNumber: 'TRACK789012',
    createdAt: '2024-10-28T12:00:00Z',
    updatedAt: '2024-10-29T09:00:00Z',
  },
];

// ==================== Dashboard Stats ====================
export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  totalBrands: 35,
  totalOrders: 3842,
  totalRevenue: 4896900,
  revenueChange: 12.5,
  ordersChange: 8.3,
  usersChange: 15.2,
  brandsChange: 5.7,
};

// ==================== Admin Users ====================
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@dreamx.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    lastLogin: '2024-10-30T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    twoFactorEnabled: true,
  },
  {
    id: 'admin-2',
    email: 'brandmanager@dreamx.com',
    firstName: 'Brand',
    lastName: 'Manager',
    role: UserRole.BRAND_MANAGER,
    isActive: true,
    lastLogin: '2024-10-29T14:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

// ==================== Transactions ====================
export const mockTransactions: Transaction[] = mockOrders.map((order, index) => ({
  id: `trans-${index + 1}`,
  orderId: order.id,
  brandId: order.brandId,
  brandName: order.brandName,
  amount: order.total,
  platformCommission: order.platformCommission,
  brandPayout: order.brandPayout,
  status: order.paymentStatus,
  createdAt: order.createdAt,
}));

// ==================== Brand Payouts ====================
export const mockBrandPayouts: BrandPayout[] = mockBrands
  .filter(b => b.status === BrandStatus.ACTIVE)
  .map(brand => {
    const brandOrders = mockOrders.filter(o => o.brandId === brand.id);
    const totalSales = brandOrders.reduce((sum, o) => sum + o.total, 0);
    const platformCommission = brandOrders.reduce((sum, o) => sum + o.platformCommission, 0);
    
    return {
      brandId: brand.id,
      brandName: brand.name,
      totalSales,
      platformCommission,
      amountOwed: totalSales - platformCommission,
      lastPayoutDate: '2024-10-01T00:00:00Z',
      lastPayoutAmount: 50000,
      pendingOrders: brandOrders.filter(o => o.orderStatus !== OrderStatus.DELIVERED).length,
    };
  });

// ==================== Banners ====================
export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Summer Sale 2024',
    image: 'https://placehold.co/1200x400/FF6B6B/FFFFFF?text=Summer+Sale',
    buttonText: 'Shop Now',
    link: '/sale',
    order: 1,
    isActive: true,
    createdAt: '2024-05-15T10:00:00Z',
  },
  {
    id: 'banner-2',
    title: 'New Arrivals',
    image: 'https://placehold.co/1200x400/4ECDC4/FFFFFF?text=New+Arrivals',
    buttonText: 'Check New',
    link: '/new-arrivals',
    order: 2,
    isActive: true,
    createdAt: '2024-09-01T10:00:00Z',
  },
];

// ==================== Coupons ====================
export const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'DREAM10',
    description: '10% off on all orders',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 1000,
    maxDiscount: 500,
    usageLimit: 1000,
    usageCount: 234,
    isActive: true,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'coupon-2',
    code: 'STYLECRAFT50',
    description: '₹50 off on StyleCraft products',
    discountType: 'fixed',
    discountValue: 50,
    minPurchase: 500,
    brandId: 'brand-1',
    brandName: 'StyleCraft',
    usageLimit: 500,
    usageCount: 89,
    isActive: true,
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    createdAt: '2024-05-15T00:00:00Z',
  },
];

// ==================== Audit Logs ====================
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'admin-1',
    userEmail: 'admin@dreamx.com',
    action: 'APPROVE_BRAND',
    resource: 'Brand',
    resourceId: 'brand-1',
    details: { brandName: 'StyleCraft', status: 'approved' },
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-16T14:30:00Z',
  },
  {
    id: 'audit-2',
    userId: 'admin-1',
    userEmail: 'admin@dreamx.com',
    action: 'APPROVE_PRODUCT',
    resource: 'Product',
    resourceId: 'product-1',
    details: { productName: 'Classic White T-Shirt', status: 'approved' },
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-21T11:00:00Z',
  },
  {
    id: 'audit-3',
    userId: 'admin-2',
    userEmail: 'brandmanager@dreamx.com',
    action: 'UPDATE_PRODUCT_STATUS',
    resource: 'Product',
    resourceId: 'product-2',
    details: { productName: 'Denim Jacket', oldStatus: 'pending', newStatus: 'approved' },
    ipAddress: '192.168.1.101',
    timestamp: '2024-02-16T12:00:00Z',
  },
];

// ==================== Helper Functions ====================

export function getPaginatedData<T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);
  
  return {
    data: paginatedData,
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
  };
}

export function filterData<T extends Record<string, any>>(
  data: T[],
  filters: Record<string, any>
): T[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      
      // Handle search
      if (key === 'search') {
        const searchValue = value.toLowerCase();
        return Object.values(item).some(v =>
          String(v).toLowerCase().includes(searchValue)
        );
      }
      
      // Handle exact match
      return item[key] === value;
    });
  });
}

export function sortData<T extends Record<string, any>>(
  data: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}
