// MSW Handlers for Admin API

import { http, HttpResponse } from 'msw';
import {
  mockBrands,
  mockCustomers,
  mockProducts,
  mockCategories,
  mockOrders,
  mockDashboardStats,
  mockTransactions,
  mockBrandPayouts,
  mockBanners,
  mockCoupons,
  mockAuditLogs,
  mockAdminUsers,
  getPaginatedData,
  filterData,
  sortData,
} from '../data/mockData';
import { BrandStatus, ProductStatus, OrderStatus } from '../../lib/api/admin/types';

const productionUrl = 'https://dreamx-store.onrender.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'production' ? `${productionUrl}/api` : 'http://localhost:3000/api');

if (typeof window !== 'undefined') {
  console.log('[MSW] Initializing admin handlers with API_URL:', API_URL);
}

export const adminHandlers = [
  // ==================== Dashboard ====================
  
  http.get(`${API_URL}/admin/dashboard/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: mockDashboardStats,
    });
  }),

  http.get(`${API_URL}/admin/dashboard/recent-orders`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    return HttpResponse.json({
      success: true,
      data: mockOrders.slice(0, limit).map(order => ({
        id: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        status: order.orderStatus,
        total: order.total,
        createdAt: order.createdAt,
      })),
    });
  }),

  http.get(`${API_URL}/admin/dashboard/recent-brands`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    return HttpResponse.json({
      success: true,
      data: mockBrands.slice(0, limit).map(brand => ({
        id: brand.id,
        name: brand.name,
        ownerEmail: brand.ownerEmail,
        status: brand.status,
        createdAt: brand.createdAt,
      })),
    });
  }),

  // ==================== Brand Management ====================
  
  http.get(`${API_URL}/admin/brands`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    let filtered = [...mockBrands];
    
    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.ownerEmail.toLowerCase().includes(searchLower) ||
        b.location.toLowerCase().includes(searchLower)
      );
    }
    
    filtered = sortData(filtered, sortBy, sortOrder);
    const paginated = getPaginatedData(filtered, page, limit);
    
    return HttpResponse.json({
      success: true,
      ...paginated,
    });
  }),

  http.get(`${API_URL}/admin/brands/:id`, ({ params }) => {
    const brand = mockBrands.find(b => b.id === params.id);
    
    if (!brand) {
      return HttpResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: brand,
    });
  }),

  http.post(`${API_URL}/admin/brands`, async ({ request }) => {
    const data = await request.json() as any;
    const newBrand = {
      id: `brand-${Date.now()}`,
      ...data,
      productCount: 0,
      status: BrandStatus.PENDING,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockBrands.push(newBrand);
    
    return HttpResponse.json({
      success: true,
      data: newBrand,
    }, { status: 201 });
  }),

  http.put(`${API_URL}/admin/brands/:id`, async ({ params, request }) => {
    const data = await request.json() as any;
    const index = mockBrands.findIndex(b => b.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    mockBrands[index] = { ...mockBrands[index], ...data };
    
    return HttpResponse.json({
      success: true,
      data: mockBrands[index],
    });
  }),

  http.delete(`${API_URL}/admin/brands/:id`, ({ params }) => {
    const index = mockBrands.findIndex(b => b.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    mockBrands.splice(index, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  }),

  http.post(`${API_URL}/admin/brands/:id/approve`, ({ params }) => {
    const index = mockBrands.findIndex(b => b.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    mockBrands[index].status = BrandStatus.ACTIVE;
    mockBrands[index].approvedAt = new Date().toISOString();
    mockBrands[index].approvedBy = 'admin-1';
    
    return HttpResponse.json({
      success: true,
      data: mockBrands[index],
    });
  }),

  http.post(`${API_URL}/admin/brands/:id/reject`, async ({ params, request }) => {
    const { reason } = await request.json() as any;
    const index = mockBrands.findIndex(b => b.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    mockBrands[index].status = BrandStatus.REJECTED;
    
    return HttpResponse.json({
      success: true,
      data: mockBrands[index],
    });
  }),

  http.patch(`${API_URL}/admin/brands/:id/status`, async ({ params, request }) => {
    const { status } = await request.json() as any;
    const index = mockBrands.findIndex(b => b.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }
    
    mockBrands[index].status = status;
    
    return HttpResponse.json({
      success: true,
      data: mockBrands[index],
    });
  }),

  // ==================== Customer Management ====================
  
  http.get(`${API_URL}/admin/customers`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');

    let filtered = [...mockCustomers];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
      );
    }
    
    const paginated = getPaginatedData(filtered, page, limit);
    
    return HttpResponse.json({
      success: true,
      ...paginated,
    });
  }),

  http.get(`${API_URL}/admin/customers/:id`, ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);
    
    if (!customer) {
      return HttpResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: customer,
    });
  }),

  http.get(`${API_URL}/admin/customers/:id/orders`, ({ params }) => {
    const orders = mockOrders.filter(o => o.customerId === params.id);
    
    return HttpResponse.json({
      success: true,
      data: orders,
    });
  }),

  http.put(`${API_URL}/admin/customers/:id`, async ({ params, request }) => {
    const data = await request.json() as any;
    const index = mockCustomers.findIndex(c => c.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    mockCustomers[index] = { ...mockCustomers[index], ...data };
    
    return HttpResponse.json({
      success: true,
      data: mockCustomers[index],
    });
  }),

  http.patch(`${API_URL}/admin/customers/:id/status`, async ({ params, request }) => {
    const { status } = await request.json() as any;
    const index = mockCustomers.findIndex(c => c.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    mockCustomers[index].status = status;
    
    return HttpResponse.json({
      success: true,
      data: mockCustomers[index],
    });
  }),

  http.post(`${API_URL}/admin/customers/:id/reset-password`, ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);
    
    if (!customer) {
      return HttpResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: { tempPassword: 'TEMP' + Math.random().toString(36).substring(7).toUpperCase() },
    });
  }),

  // ==================== Product Management ====================
  // DISABLED: Using real backend API for products instead of MSW mocks

  // ==================== Category Management ====================
  
  http.get(`${API_URL}/admin/categories`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCategories,
    });
  }),

  http.post(`${API_URL}/admin/categories`, async ({ request }) => {
    const data = await request.json() as any;
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...data,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockCategories.push(newCategory);
    
    return HttpResponse.json({
      success: true,
      data: newCategory,
    }, { status: 201 });
  }),

  // ==================== Order Management ====================
  
  http.get(`${API_URL}/admin/orders`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    let filtered = [...mockOrders];
    
    if (status) {
      filtered = filtered.filter(o => o.orderStatus === status);
    }
    
    const paginated = getPaginatedData(filtered, page, limit);
    
    return HttpResponse.json({
      success: true,
      ...paginated,
    });
  }),

  http.get(`${API_URL}/admin/orders/:id`, ({ params }) => {
    const order = mockOrders.find(o => o.id === params.id);
    
    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: order,
    });
  }),

  http.patch(`${API_URL}/admin/orders/:id/status`, async ({ params, request }) => {
    const { status } = await request.json() as any;
    const index = mockOrders.findIndex(o => o.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    mockOrders[index].orderStatus = status;
    mockOrders[index].updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      data: mockOrders[index],
    });
  }),

  http.patch(`${API_URL}/admin/orders/:id/tracking`, async ({ params, request }) => {
    const { trackingNumber } = await request.json() as any;
    const index = mockOrders.findIndex(o => o.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    mockOrders[index].trackingNumber = trackingNumber;
    mockOrders[index].updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      data: mockOrders[index],
    });
  }),

  http.post(`${API_URL}/admin/orders/:id/cancel`, async ({ params, request }) => {
    const { reason } = await request.json() as any;
    const index = mockOrders.findIndex(o => o.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    mockOrders[index].orderStatus = OrderStatus.CANCELLED;
    mockOrders[index].updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      data: mockOrders[index],
    });
  }),

  // ==================== Finance & Payouts ====================
  
  http.get(`${API_URL}/admin/finance/transactions`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const paginated = getPaginatedData(mockTransactions, page, limit);
    
    return HttpResponse.json({
      success: true,
      ...paginated,
    });
  }),

  http.get(`${API_URL}/admin/finance/payouts`, () => {
    return HttpResponse.json({
      success: true,
      data: mockBrandPayouts,
    });
  }),

  http.get(`${API_URL}/admin/finance/commission-settings`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        defaultRate: 15,
        categoryRates: {
          'electronics': 10,
          'fashion': 15,
          'accessories': 20,
        },
      },
    });
  }),

  // ==================== Content Management ====================
  
  http.get(`${API_URL}/admin/content/banners`, () => {
    return HttpResponse.json({
      success: true,
      data: mockBanners,
    });
  }),

  http.post(`${API_URL}/admin/content/banners`, async ({ request }) => {
    const data = await request.json() as any;
    const newBanner = {
      id: `banner-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    mockBanners.push(newBanner);
    
    return HttpResponse.json({
      success: true,
      data: newBanner,
    }, { status: 201 });
  }),

  http.get(`${API_URL}/admin/content/coupons`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCoupons,
    });
  }),

  http.post(`${API_URL}/admin/content/coupons`, async ({ request }) => {
    const data = await request.json() as any;
    const newCoupon = {
      id: `coupon-${Date.now()}`,
      ...data,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockCoupons.push(newCoupon);
    
    return HttpResponse.json({
      success: true,
      data: newCoupon,
    }, { status: 201 });
  }),

  // ==================== Analytics ====================
  
  http.get(`${API_URL}/admin/analytics`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        salesOverTime: [
          { period: '2024-10-01', revenue: 45000, orders: 123, avgOrderValue: 365.85, customers: 98 },
          { period: '2024-10-08', revenue: 52000, orders: 145, avgOrderValue: 358.62, customers: 115 },
          { period: '2024-10-15', revenue: 48000, orders: 132, avgOrderValue: 363.64, customers: 102 },
          { period: '2024-10-22', revenue: 61000, orders: 167, avgOrderValue: 365.27, customers: 134 },
          { period: '2024-10-29', revenue: 58000, orders: 156, avgOrderValue: 371.79, customers: 128 },
        ],
        topProducts: mockProducts.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          brandName: p.brandName,
          sales: p.sales,
          revenue: p.price * p.sales,
          image: p.images[0],
        })),
        topBrands: mockBrands.slice(0, 5).map(b => ({
          id: b.id,
          name: b.name,
          sales: b.totalSales / 1000,
          revenue: b.totalSales,
          productCount: b.productCount,
          logo: b.logo,
        })),
        conversionRate: 3.2,
        newCustomers: 342,
        returningCustomers: 905,
      },
    });
  }),

  // ==================== Audit Logs ====================
  
  http.get(`${API_URL}/admin/audit-logs`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const paginated = getPaginatedData(mockAuditLogs, page, limit);
    
    return HttpResponse.json({
      success: true,
      ...paginated,
    });
  }),
];
