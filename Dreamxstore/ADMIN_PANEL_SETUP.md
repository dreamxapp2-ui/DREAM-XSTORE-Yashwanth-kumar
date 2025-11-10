# Admin Panel with RBAC & MSW - Complete Setup Guide

## 📦 Installation

First, install Mock Service Worker (MSW):

```bash
npm install msw@latest --save-dev
# or
yarn add msw@latest --dev
```

Initialize MSW in your public directory:

```bash
npx msw init public/ --save
```

## 🏗️ Project Structure

```
src/
├── lib/api/
│   ├── rbac/
│   │   ├── types.ts                # RBAC type definitions
│   │   └── permissions.ts          # Role permissions configuration
│   ├── admin/
│   │   ├── types.ts                # Admin panel type definitions
│   │   └── adminService.ts         # Admin API service layer
│   └── ...
├── mocks/
│   ├── data/
│   │   └── mockData.ts             # Mock data generators
│   ├── handlers/
│   │   └── adminHandlers.ts        # MSW request handlers
│   └── browser.ts                  # MSW setup
```

## 🚀 Quick Start

### 1. Enable MSW in Development

Update your `src/index.tsx` or app entry point:

```typescript
// src/index.tsx or src/App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function enableMocking() {
  // Only enable MSW in development
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser');
    
    return worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

### 2. Use Admin Services

```typescript
import { AdminService } from '@/lib/api/admin/adminService';
import { hasPermission, Permission } from '@/lib/api/rbac/permissions';
import { UserRole } from '@/lib/api/rbac/types';

// Check permissions
const currentUserRole = UserRole.BRAND_MANAGER;
const canViewBrands = hasPermission(currentUserRole, Permission.VIEW_BRANDS);

// Fetch data
async function loadDashboard() {
  try {
    // Get dashboard stats
    const stats = await AdminService.getDashboardStats();
    console.log('Stats:', stats);

    // Get recent orders
    const orders = await AdminService.getRecentOrders(5);
    console.log('Recent orders:', orders);

    // Get recent brands
    const brands = await AdminService.getRecentBrands(5);
    console.log('Recent brands:', brands);
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}
```

## 🎯 Features Implemented

### 1. Role-Based Access Control (RBAC)

**Available Roles:**
- `SUPER_ADMIN` - Full access to everything
- `BRAND_MANAGER` - Manage brands and products
- `ORDER_MANAGER` - Manage orders and refunds
- `SUPPORT_STAFF` - View-only access for customer support
- `BRAND_OWNER` - Manage own brand products
- `CUSTOMER` - Regular customer (no admin access)

**Permission Checking:**

```typescript
import { hasPermission, Permission, UserRole } from '@/lib/api/rbac';

// Check single permission
const canApprove = hasPermission(UserRole.BRAND_MANAGER, Permission.APPROVE_BRANDS);

// Check multiple permissions
const canManageOrders = hasAllPermissions(
  UserRole.ORDER_MANAGER,
  [Permission.VIEW_ORDERS, Permission.EDIT_ORDERS]
);

// Check if user is admin
const isAdminUser = isAdmin(currentUserRole);
```

### 2. Admin Dashboard

```typescript
// Get dashboard statistics
const stats = await AdminService.getDashboardStats();
// Returns: { totalUsers, totalBrands, totalOrders, totalRevenue, ...changes }

// Get recent activity
const recentOrders = await AdminService.getRecentOrders(10);
const recentBrands = await AdminService.getRecentBrands(10);
```

### 3. Brand Management

```typescript
// Get all brands with filters
const brands = await AdminService.getBrands({
  status: BrandStatus.PENDING,
  search: 'style',
  page: 1,
  limit: 20,
});

// Approve brand
await AdminService.approveBrand('brand-id');

// Reject brand
await AdminService.rejectBrand('brand-id', 'Quality standards not met');

// Update brand
await AdminService.updateBrand('brand-id', {
  commissionRate: 20,
  status: BrandStatus.ACTIVE,
});
```

### 4. Customer Management

```typescript
// Get all customers
const customers = await AdminService.getCustomers({
  status: UserStatus.ACTIVE,
  search: 'john',
  page: 1,
});

// Get customer details
const customer = await AdminService.getCustomerById('customer-id');

// Get customer order history
const orders = await AdminService.getCustomerOrders('customer-id');

// Ban/unban customer
await AdminService.updateCustomerStatus('customer-id', UserStatus.BANNED);

// Reset password
const { tempPassword } = await AdminService.resetCustomerPassword('customer-id');
```

### 5. Product Management

```typescript
// Get pending products for approval
const pending = await AdminService.getPendingProducts();

// Get all products with filters
const products = await AdminService.getProducts({
  status: ProductStatus.ACTIVE,
  brandId: 'brand-id',
  featured: true,
});

// Approve product
await AdminService.approveProduct('product-id');

// Reject product
await AdminService.rejectProduct('product-id', 'Does not meet guidelines');

// Toggle featured status
await AdminService.toggleFeaturedProduct('product-id', true);

// Update product
await AdminService.updateProduct('product-id', {
  price: 2999,
  stock: 100,
});
```

### 6. Category Management

```typescript
// Get all categories
const categories = await AdminService.getCategories();

// Create category
await AdminService.createCategory({
  name: 'T-Shirts',
  slug: 't-shirts',
  description: 'Casual and formal t-shirts',
});

// Update category
await AdminService.updateCategory('cat-id', {
  name: 'Premium T-Shirts',
});

// Delete category
await AdminService.deleteCategory('cat-id');
```

### 7. Order Management

```typescript
// Get all orders
const orders = await AdminService.getOrders({
  status: OrderStatus.PENDING,
  brandId: 'brand-id',
  page: 1,
});

// Update order status
await AdminService.updateOrderStatus('order-id', OrderStatus.SHIPPED);

// Update tracking number
await AdminService.updateOrderTracking('order-id', 'TRACK123456');

// Cancel order
await AdminService.cancelOrder('order-id', 'Customer requested cancellation');
```

### 8. Finance & Payouts

```typescript
// Get all transactions
const transactions = await AdminService.getTransactions(1, 20);

// Get brand payouts summary
const payouts = await AdminService.getBrandPayouts();

// Process payout
await AdminService.createPayout('brand-id', 50000);

// Get refund requests
const refunds = await AdminService.getRefundRequests('pending');

// Process refund
await AdminService.processRefund('refund-id', true, 'Approved - Product defective');

// Get/update commission settings
const settings = await AdminService.getCommissionSettings();
await AdminService.updateCommissionSettings({
  defaultRate: 15,
  categoryRates: { electronics: 10, fashion: 15 },
});
```

### 9. Analytics

```typescript
// Get analytics data
const analytics = await AdminService.getAnalytics('2024-10-01', '2024-10-31');
// Returns: { salesOverTime, topProducts, topBrands, conversionRate, ... }

// Export report
await AdminService.exportReport('csv', '2024-10-01', '2024-10-31');
```

### 10. Content Management

```typescript
// Banners
const banners = await AdminService.getBanners();
await AdminService.createBanner({
  title: 'Summer Sale',
  subtitle: '50% off',
  image: 'url',
  isActive: true,
  position: 1,
});

// Coupons
const coupons = await AdminService.getCoupons();
await AdminService.createCoupon({
  code: 'SAVE20',
  discountType: 'percentage',
  discountValue: 20,
  isActive: true,
  startDate: '2024-11-01',
  endDate: '2024-12-31',
});
```

### 11. Audit Logs

```typescript
// Get audit logs
const logs = await AdminService.getAuditLogs(1, 50, 'admin-id', 'APPROVE_BRAND');

// Export audit logs
await AdminService.exportAuditLogs('2024-10-01', '2024-10-31');
```

## 🔒 Security Best Practices

### 1. Check Permissions Before Actions

```typescript
// In your components
function BrandApprovalButton({ brandId, userRole }) {
  const canApprove = hasPermission(userRole, Permission.APPROVE_BRANDS);

  if (!canApprove) {
    return null; // Don't show button if no permission
  }

  return (
    <button onClick={() => AdminService.approveBrand(brandId)}>
      Approve Brand
    </button>
  );
}
```

### 2. Protected Routes

```typescript
// Route protection HOC
import { isAdmin } from '@/lib/api/rbac/permissions';

function withAdminAccess(Component, requiredRole) {
  return function ProtectedRoute(props) {
    const currentUser = getCurrentUser(); // Get from auth context
    
    if (!isAdmin(currentUser.role)) {
      // Redirect to login or show error
      return <Navigate to="/login" />;
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      // User doesn't have required role
      return <div>Access Denied</div>;
    }

    return <Component {...props} />;
  };
}

// Usage
export default withAdminAccess(AdminDashboard, UserRole.SUPER_ADMIN);
```

### 3. API-Level Protection

```typescript
// The API client automatically sends auth tokens
// Backend should verify:
// 1. Token is valid
// 2. User has required role
// 3. User has required permissions

// Example backend middleware (Express)
function requirePermission(permission) {
  return async (req, res, next) => {
    const user = req.user; // From auth middleware
    
    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
router.post('/admin/brands/:id/approve', 
  authenticate,
  requirePermission(Permission.APPROVE_BRANDS),
  approveController
);
```

## 🔄 Switching from MSW to Real Backend

When your backend is ready:

### Option 1: Environment Variable

```typescript
// src/index.tsx
async function enableMocking() {
  // Only use MSW if explicitly enabled
  if (process.env.REACT_APP_USE_MSW === 'true') {
    const { worker } = await import('./mocks/browser');
    return worker.start();
  }
}
```

Then in `.env.local`:
```env
# Use MSW for development
REACT_APP_USE_MSW=true

# Use real backend
REACT_APP_USE_MSW=false
NEXT_PUBLIC_API_URL=https://api.dreamxstore.com
```

### Option 2: Conditional Import

```typescript
// Remove or comment out MSW setup
// async function enableMocking() {
//   if (process.env.NODE_ENV === 'development') {
//     const { worker } = await import('./mocks/browser');
//     return worker.start();
//   }
// }

// Just start your app normally
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
```

**The service layer stays exactly the same!** No code changes needed in components.

## 📊 Mock Data

All mock data is in `src/mocks/data/mockData.ts`. You can:

- Add more mock records
- Modify existing data
- Create custom data generators
- Import and use in tests

```typescript
import { mockBrands, mockOrders, mockCustomers } from '@/mocks/data/mockData';

// Use in your tests
test('displays brands', () => {
  render(<BrandList brands={mockBrands} />);
  expect(screen.getByText('StyleCraft')).toBeInTheDocument();
});
```

## 🧪 Testing

MSW is perfect for testing:

```typescript
// In your test setup
import { setupServer } from 'msw/node';
import { adminHandlers } from '@/mocks/handlers/adminHandlers';

const server = setupServer(...adminHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Your tests will use mock data automatically
test('loads dashboard stats', async () => {
  const stats = await AdminService.getDashboardStats();
  expect(stats.totalUsers).toBe(1247);
});
```

## 📝 TypeScript Support

Everything is fully typed:

```typescript
import type {
  Brand,
  Customer,
  AdminProduct,
  AdminOrder,
  BrandStatus,
  UserStatus,
  ProductStatus,
  OrderStatus,
} from '@/lib/api/admin/types';

import type {
  UserRole,
  Permission,
  AdminUser,
  AuditLog,
} from '@/lib/api/rbac/types';
```

## 🎨 UI Components (Recommended)

For building the admin panel UI, consider:

1. **Tables**: Use a data table library like:
   - TanStack Table (React Table)
   - AG Grid
   - MUI DataGrid

2. **Charts**: Use for analytics:
   - Recharts
   - Chart.js
   - ApexCharts

3. **Forms**: For creating/editing:
   - React Hook Form + Zod
   - Formik

4. **UI Library**:
   - Material-UI (MUI)
   - Ant Design
   - Shadcn/ui (already in your project!)

## 🚨 Important Notes

1. **MSW only intercepts fetch/XHR requests** - It doesn't actually create a server
2. **Data is not persisted** - Refreshing the page resets mock data
3. **For real persistence** - Use localStorage or IndexedDB with MSW
4. **Backend API should match** - Keep same endpoints and response formats

## 📚 Additional Resources

- [MSW Documentation](https://mswjs.io/)
- [RBAC Best Practices](https://auth0.com/intro-to-iam/what-is-role-based-access-control-rbac)
- [Admin Dashboard Design Patterns](https://www.nngroup.com/articles/dashboard-design/)

## 🆘 Troubleshooting

### MSW not intercepting requests

1. Make sure `npx msw init public/` was run
2. Check that `mockServiceWorker.js` exists in `public/` folder
3. Verify MSW is started before making requests
4. Check browser console for MSW logs

### TypeScript errors

Run: `npm install msw@latest --save-dev`

### Requests going to real backend

Check that MSW worker.start() was called successfully. Add logging:

```typescript
worker.start({
  onUnhandledRequest: 'warn',
}).then(() => {
  console.log('MSW is running!');
});
```

---

## ✅ What's Included

- ✅ Complete RBAC system with 6 roles
- ✅ 50+ permissions granularly defined
- ✅ Complete admin service layer (500+ lines)
- ✅ Comprehensive mock data
- ✅ 30+ MSW handlers
- ✅ Full TypeScript support
- ✅ Ready to switch to real backend
- ✅ Audit logging system
- ✅ Finance & payout management
- ✅ Analytics & reporting
- ✅ Content management (banners, coupons)

Start building your admin UI now! The entire backend is mocked and ready. 🎉
