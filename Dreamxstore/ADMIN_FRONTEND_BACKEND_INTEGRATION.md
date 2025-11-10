# Admin Panel - Frontend to Backend Integration

## Overview

The admin panel frontend has been successfully connected to the backend. This document outlines the changes made and how to use the admin system.

---

## What Was Changed

### 1. **MSW Mock Data Disabled**
   - **File:** `Dreamxstore/src/mocks/browser.ts`
   - **Change:** Admin handlers have been commented out
   - **Reason:** Using real backend API at `http://localhost:3000/api`

### 2. **Admin Authentication Service Created**
   - **File:** `Dreamxstore/src/lib/api/admin/authService.ts`
   - **Features:**
     - Admin login with email and password
     - Token management using `TokenManager`
     - Admin role verification
     - Logout functionality

### 3. **Admin Login Page Created**
   - **File:** `Dreamxstore/app/admin/login/page.tsx`
   - **Features:**
     - Beautiful login UI with gradient background
     - Email and password input
     - Error handling and loading states
     - Form validation
     - Redirects to dashboard on success

### 4. **Admin Layout Updated**
   - **File:** `Dreamxstore/app/admin/layout.tsx`
   - **Features:**
     - Authentication check on page load
     - Redirects unauthenticated users to login
     - Displays admin user info in sidebar
     - Logout button functionality
     - Shows admin name and role

### 5. **API Configuration Updated**
   - **File:** `Dreamxstore/src/lib/api/config.ts`
   - **Change:** Base URL now points to `http://localhost:3000/api`
   - **Note:** Configured via `NEXT_PUBLIC_API_URL` env variable

### 6. **User Type Extended**
   - **File:** `Dreamxstore/src/lib/api/types.ts`
   - **Change:** Added `role` field to User interface
   - **Values:** `'user' | 'admin' | 'superadmin'`

---

## How to Use

### Step 1: Start the Backend

```bash
cd API-Backend
npm start
# or
npm run dev
```

The backend should run on `http://localhost:3000`

### Step 2: Start the Frontend

```bash
cd Dreamxstore
npm run dev
```

The frontend should run on `http://localhost:3001`

### Step 3: Create Superadmin User (First Time Only)

```bash
cd API-Backend
node scripts/seedSuperadmin.js
```

This creates a superadmin with:
- Email: `admin@dreamxstore.com`
- Password: `AdminPass@123`

### Step 4: Login to Admin Panel

1. Navigate to `http://localhost:3001/admin/login`
2. Enter superadmin credentials:
   - Email: `admin@dreamxstore.com`
   - Password: `AdminPass@123`
3. Click "Sign in"
4. You'll be redirected to `/admin` dashboard

---

## API Endpoints Used

### Admin Authentication

```
POST /api/admin/login
Body: {
  email: string,
  password: string
}

Response: {
  success: boolean,
  message: string,
  token: string,
  user: {
    id: string,
    email: string,
    username: string,
    role: 'admin' | 'superadmin',
    firstName?: string,
    lastName?: string
  }
}
```

### Admin Dashboard Stats

```
GET /api/admin/stats
Authorization: Bearer <token>

Response: {
  success: boolean,
  stats: {
    totalUsers: number,
    totalAdmins: number,
    totalBrands: number,
    verifiedUsers: number,
    unverifiedUsers: number
  }
}
```

### Get Recent Orders

```
GET /api/admin/dashboard/recent-orders?limit=5
Authorization: Bearer <token>

Response: {
  success: boolean,
  data: RecentOrder[]
}
```

### Get Recent Brands

```
GET /api/admin/dashboard/recent-brands?limit=5
Authorization: Bearer <token>

Response: {
  success: boolean,
  data: RecentBrand[]
}
```

---

## File Structure

```
Dreamxstore/
├── src/
│   └── lib/api/
│       ├── admin/
│       │   ├── authService.ts       [NEW]
│       │   ├── adminService.ts      [EXISTING]
│       │   └── types.ts             [EXISTING]
│       ├── client.ts                [EXISTING - handles auth]
│       ├── tokenManager.ts          [EXISTING - stores tokens]
│       ├── config.ts                [MODIFIED - API URL]
│       └── types.ts                 [MODIFIED - added role]
├── mocks/
│   └── browser.ts                   [MODIFIED - disabled admin handlers]
└── app/
    └── admin/
        ├── login/
        │   └── page.tsx             [NEW]
        ├── layout.tsx               [MODIFIED - auth checks]
        └── page.tsx                 [EXISTING - uses real API]
```

---

## Authentication Flow

```
1. User navigates to /admin/login
   ↓
2. User enters email & password
   ↓
3. Frontend sends POST /api/admin/login
   ↓
4. Backend validates credentials & checks role
   ↓
5. If valid admin/superadmin:
   - Returns JWT token
   - Frontend stores token in localStorage
   ↓
6. User redirected to /admin dashboard
   ↓
7. Layout component checks auth on load
   ↓
8. Token automatically added to all API requests
   ↓
9. Backend validates token on protected routes
```

---

## Token Management

### How Tokens Are Stored

```javascript
// TokenManager (src/lib/api/tokenManager.ts)
localStorage.getItem('token')           // Auth token
localStorage.getItem('refreshToken')    // Refresh token
localStorage.getItem('dreamx_user')     // User data
```

### How Tokens Are Used

```javascript
// Automatically added to all requests
Authorization: Bearer <token>
```

### Token Refresh

The API client automatically:
- Detects expired tokens (401 errors)
- Refreshes the token
- Retries the failed request
- Queues requests during refresh

---

## Authorization

### Role-Based Access

The backend implements role-based authorization:

```
superadmin: Full access to all admin endpoints
admin:      Can perform admin operations
user:       Regular user - no admin access
```

### Frontend Role Checking

```typescript
import AdminAuthService from '@/src/lib/api/admin/authService';

// Check if authenticated
AdminAuthService.isAuthenticated()  // boolean

// Check if superadmin
AdminAuthService.isSuperAdmin()     // boolean

// Get current user
AdminAuthService.getCurrentUser()   // User | null

// Get current role
const user = AdminAuthService.getCurrentUser();
console.log(user?.role);            // 'admin' | 'superadmin'
```

---

## Error Handling

### Login Errors

The login page handles various errors:

1. **Invalid credentials** → "Login failed"
2. **User not admin** → "Access denied. Only admins can access this panel"
3. **Network error** → "Failed to login. Please try again"
4. **Server error** → API error message

### API Errors

The API client automatically:
- Logs errors in development
- Handles 401 (unauthorized) errors
- Handles 403 (forbidden) errors
- Retries on network failures
- Shows user-friendly error messages

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_PAY_API_URL=http://localhost:3004
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_gZaMQT84FVZ7r9
```

### Notes:
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- All endpoints prefixed with `/api` automatically
- Example: `/admin/login` → `http://localhost:3000/api/admin/login`

---

## Testing the Integration

### Test 1: Admin Login
```bash
# 1. Start backend on localhost:3000
# 2. Create superadmin: node scripts/seedSuperadmin.js
# 3. Start frontend on localhost:3001
# 4. Go to http://localhost:3001/admin/login
# 5. Enter: admin@dreamxstore.com / AdminPass@123
# 6. Should redirect to dashboard
```

### Test 2: Authentication Persistence
```bash
# 1. Login to admin panel
# 2. Refresh the page (F5)
# 3. Should still show dashboard (token in localStorage)
# 4. Clear localStorage
# 5. Refresh page → Should redirect to login
```

### Test 3: Dashboard Data Loading
```bash
# 1. Login to admin panel
# 2. Dashboard should show:
#    - Total Revenue
#    - Total Orders
#    - Total Brands
#    - Total Users
#    - Recent Orders
#    - Recent Brands
# 3. All data from real backend
```

### Test 4: Logout
```bash
# 1. Login to admin panel
# 2. Click logout button (top right)
# 3. Should redirect to login page
# 4. localStorage should be cleared
```

---

## Troubleshooting

### Issue: "Access denied. Only admins can access this panel"
**Solution:** 
- Verify you're using superadmin credentials
- Run seed script: `node scripts/seedSuperadmin.js`
- Check user role in database

### Issue: "Failed to login. Please try again"
**Solution:**
- Verify backend is running on `http://localhost:3000`
- Check API URL in `.env.local`
- Check backend logs for errors
- Verify MongoDB is running

### Issue: Token keeps getting rejected
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Login again to get fresh token
- Check JWT_SECRET in backend .env

### Issue: Redirected to login after page refresh
**Solution:**
- Token might be expired
- Login again
- Check token expiration (30 days)

### Issue: Dashboard shows "Failed to load dashboard data"
**Solution:**
- Check backend logs
- Verify token is valid
- Check `/api/admin/stats` endpoint exists
- Verify admin user has correct role

---

## Next Steps

### 1. Protect Other Admin Routes

All admin pages already use the layout which checks authentication:

```
✅ /admin            - Protected
✅ /admin/login      - Login page
✅ /admin/brands     - Protected
✅ /admin/products   - Protected
✅ /admin/orders     - Protected
✅ /admin/customers  - Protected
✅ /admin/analytics  - Protected
✅ /admin/settings   - Protected
```

### 2. Connect Other Admin Pages to Backend

Update each admin page component to use real API:

```typescript
// Example: admin/brands/page.tsx
const [brands, setBrands] = useState<Brand[]>([]);

useEffect(() => {
  const loadBrands = async () => {
    try {
      const response = await AdminService.getBrands();
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };
  loadBrands();
}, []);
```

### 3. Implement Remaining Features

- [ ] Product approval workflow
- [ ] Brand management
- [ ] Customer management
- [ ] Order management
- [ ] Analytics dashboard
- [ ] Settings page

---

## Security Notes

1. **Token Security**
   - Tokens stored in localStorage (vulnerable to XSS)
   - Consider HttpOnly cookies for production
   - Token expires in 30 days

2. **Password Requirements**
   - Superadmin password: `AdminPass@123` (for demo)
   - Change immediately in production
   - Use strong passwords

3. **HTTPS**
   - Required in production
   - HTTP only for development

4. **CORS**
   - Backend CORS configured for localhost
   - Update for production domain

---

## Support

For issues, refer to:
- Backend docs: `API-Backend/SUPERADMIN_SETUP.md`
- API endpoints: Check backend routes
- Frontend API client: `Dreamxstore/src/lib/api/client.ts`

---

**Status:** ✅ Admin frontend connected to backend  
**Last Updated:** 2024  
**Ready for:** Testing and feature implementation
