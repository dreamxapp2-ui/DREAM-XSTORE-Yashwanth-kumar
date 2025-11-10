# Superadmin Integration Guide

## Complete Workflow Example

This guide shows the complete workflow from creating a superadmin to protecting routes.

---

## Phase 1: Initial Setup (First Time Only)

### Step 1.1: Ensure Environment is Ready

**File: `.env`** (in API-Backend directory)
```env
MONGODB_URI=mongodb://localhost:27017/dreamxstore
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Step 1.2: Start MongoDB

```bash
# Make sure MongoDB service is running
# On Windows: Services > MongoDB > Start
# On Mac/Linux: brew services start mongodb-community
```

### Step 1.3: Run Seed Script

```bash
cd API-Backend
node scripts/seedSuperadmin.js
```

**Output:**
```
Connecting to MongoDB...
✓ Connected to MongoDB
Hashing password...
✓ Superadmin created successfully!

═══════════════════════════════════════
SUPERADMIN CREDENTIALS
═══════════════════════════════════════
Email:    admin@dreamxstore.com
Password: AdminPass@123
═══════════════════════════════════════

IMPORTANT:
1. Save these credentials in a secure location
2. Change the password after first login
3. DO NOT commit this password to version control
...
```

---

## Phase 2: Login and Get Token

### Using cURL

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dreamxstore.com",
    "password": "AdminPass@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTZkNWU2ZjEyMzQ1Njc4OTBhYmNkZWYiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcwMTQzMDQwMCwiZXhwIjoxNzA0MDIyNDAwfQ.K5x6L9m2N3pQ8r1S2tU3vW4xY5z",
  "user": {
    "id": "656d5e6f123456789 0abcdef",
    "email": "admin@dreamxstore.com",
    "username": "superadmin",
    "role": "superadmin",
    "firstName": "Super",
    "lastName": "Admin"
  }
}
```

**Save the token** - you'll use it for all subsequent requests.

---

## Phase 3: Use the Token in Protected Routes

### Example: Get All Users

```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user1@example.com",
      "username": "john_doe",
      "role": "user",
      "isVerified": true,
      "isBrand": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "email": "designer@example.com",
      "username": "jane_smith",
      "role": "user",
      "isVerified": true,
      "isBrand": true,
      "createdAt": "2024-01-16T14:45:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

### Example: Promote User to Admin

```bash
curl -X PUT "http://localhost:3000/api/admin/users/507f1f77bcf86cd799439012/role" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "designer@example.com",
    "username": "jane_smith",
    "role": "admin"
  }
}
```

### Example: Get Dashboard Stats

```bash
curl -X GET "http://localhost:3000/api/admin/stats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalAdmins": 3,
    "totalBrands": 25,
    "verifiedUsers": 140,
    "unverifiedUsers": 10
  }
}
```

---

## Phase 4: Protect Your Own Routes

### Example: Protect Product Management Routes

**File: `routes/products.js`**

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const productController = require('../controllers/product');

// Public routes - anyone can access
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes - superadmin only
router.post('/', 
  auth,                          // Authenticate user
  authorize('superadmin'),       // Check if superadmin
  productController.createProduct
);

router.put('/:id', 
  auth, 
  authorize('superadmin'), 
  productController.updateProduct
);

router.delete('/:id', 
  auth, 
  authorize('superadmin'), 
  productController.deleteProduct
);

// Admin-only routes
router.get('/admin/analytics', 
  auth, 
  authorize(['admin', 'superadmin']),  // Both admin and superadmin
  productController.getAnalytics
);

module.exports = router;
```

**Register in `app.js`:**
```javascript
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);
```

### Example: Order Management Routes

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const orderController = require('../controllers/order');

// User can only access their own orders
router.get('/my-orders', auth, orderController.getUserOrders);

// Superadmin can view all orders
router.get('/all', 
  auth, 
  authorize('superadmin'), 
  orderController.getAllOrders
);

// Admin can update order status
router.patch('/:id/status', 
  auth, 
  authorize(['admin', 'superadmin']), 
  orderController.updateOrderStatus
);

// Only superadmin can delete
router.delete('/:id', 
  auth, 
  authorize('superadmin'), 
  orderController.deleteOrder
);

module.exports = router;
```

---

## Phase 5: Testing Your Protected Routes

### Using Postman

1. **Create new request**
   - Method: `GET`
   - URL: `http://localhost:3000/api/admin/users`

2. **Add Authorization header**
   - Click "Authorization" tab
   - Type: "Bearer Token"
   - Token: Paste the JWT token from login

3. **Send request**
   - Click "Send"
   - Should return 200 with user list

### Using JavaScript/Fetch

```javascript
// Login to get token
const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@dreamxstore.com',
    password: 'AdminPass@123'
  })
});

const { token } = await loginResponse.json();

// Use token in subsequent requests
const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const users = await usersResponse.json();
console.log(users);
```

### Using Frontend (React Example)

```javascript
// src/hooks/useAdmin.js
import { useState } from 'react';

export const useAdmin = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const login = async (email, password) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const { token } = await response.json();
    localStorage.setItem('adminToken', token);
    setToken(token);
    return token;
  };

  const fetchUsers = async (page = 1, limit = 10) => {
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  };

  return { login, fetchUsers, token };
};
```

---

## Common Scenarios

### Scenario 1: Regular User Tries to Access Admin Route

**Request:**
```bash
curl -X GET "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer <regular_user_token>"
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "requiredRole": ["superadmin"],
  "userRole": "user"
}
```

### Scenario 2: Request Without Token

**Request:**
```bash
curl -X GET "http://localhost:3000/api/admin/users"
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Scenario 3: Expired Token

**Request:**
```bash
curl -X GET "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer <expired_token>"
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## Troubleshooting

### Token not working in frontend requests

Make sure to include the full header:
```javascript
// ✓ CORRECT
headers: { 'Authorization': 'Bearer ' + token }

// ✗ WRONG - missing Bearer prefix
headers: { 'Authorization': token }

// ✗ WRONG - missing space
headers: { 'Authorization': 'Bearer' + token }
```

### 403 error when using admin token

Check the user's role in database:
```bash
# In MongoDB shell
db.users.findOne({ email: "admin@dreamxstore.com" })
# Should show: "role": "superadmin"
```

### Routes protected but frontend still can't access

Make sure middleware order is correct:
```javascript
// ✓ CORRECT ORDER
router.get('/admin', auth, authorize('superadmin'), handler);

// ✗ WRONG ORDER
router.get('/admin', authorize('superadmin'), auth, handler);
```

---

## Security Reminders

1. **Never hardcode tokens** in frontend code
2. **Always use HTTPS** in production
3. **Store tokens securely** (HttpOnly cookies or secure storage)
4. **Clear tokens on logout** from localStorage/sessionStorage
5. **Validate tokens** server-side on every protected request
6. **Implement token refresh** for long-running sessions
7. **Log all admin actions** for audit trail
8. **Rate limit login endpoint** to prevent brute force
9. **Never send passwords over HTTP**
10. **Rotate JWT_SECRET** periodically in production

---

## What's Next?

1. ✅ Superadmin system is ready
2. ✅ Authentication and authorization working
3. 👉 Integrate with frontend admin panel
4. 👉 Add logging for admin actions
5. 👉 Implement two-factor authentication
6. 👉 Set up admin dashboard UI
7. 👉 Add more admin-specific features

---

## Reference Files

- **Full Documentation:** `SUPERADMIN_SETUP.md`
- **Quick Reference:** `SUPERADMIN_QUICK_REFERENCE.md`
- **Implementation Summary:** `IMPLEMENTATION_COMPLETE.md`
- **Test Script:** `test-admin-endpoints.sh`
- **Postman Collection:** `Admin_API_Collection.postman_collection.json`

---

**Ready to use!** 🚀
