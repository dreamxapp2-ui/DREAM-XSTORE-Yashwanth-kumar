# Superadmin Setup Guide

This guide explains how to set up and use the superadmin role-based access control (RBAC) system in the Dream X Store backend.

---

## Overview

The superadmin system follows this workflow:

1. **Database Model** - User model includes a `role` field
2. **Seed Script** - One-time script to create the first superadmin
3. **Authentication** - Superadmin login with JWT token
4. **Authorization** - Middleware to protect admin routes based on role

---

## Step 1: Database Model

The User model now includes a `role` field:

```javascript
// models/User.js
role: {
  type: String,
  enum: ['user', 'admin', 'superadmin'],
  default: 'user'
}
```

**Role Types:**
- `user` - Regular user (default)
- `admin` - Can perform admin operations
- `superadmin` - Full admin privileges (can create other admins)

---

## Step 2: Create First Superadmin (Seed Script)

### Why a Seed Script?

You **cannot have a "Sign up as Superadmin" button** on your website—that would be a massive security hole.

Instead, the first superadmin is created by the developer using a seed script. This is run **once** from the terminal.

### Running the Seed Script

```bash
cd API-Backend
node scripts/seedSuperadmin.js
```

**What it does:**
1. Connects to MongoDB
2. Checks if superadmin already exists
3. If not, creates a new superadmin with:
   - Email: `admin@dreamxstore.com`
   - Password: `AdminPass@123` (change this!)
   - Role: `superadmin`
   - Verified: `true`

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
```

### Important Security Notes

1. **Change the password** in `scripts/seedSuperadmin.js` before running it in production
2. **Save the credentials** in a secure location (password manager, etc.)
3. **DO NOT commit** this password to version control
4. **Change the password** after first login via the admin panel
5. If the superadmin already exists, the script will skip creation

---

## Step 3: Authentication (Login)

### Superadmin Login Flow

**Endpoint:** `POST /api/admin/login`

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dreamxstore.com",
    "password": "AdminPass@123"
  }'
```

**Request Body:**
```json
{
  "email": "admin@dreamxstore.com",
  "password": "AdminPass@123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@dreamxstore.com",
    "username": "superadmin",
    "role": "superadmin",
    "firstName": "Super",
    "lastName": "Admin"
  }
}
```

**What Happens Behind the Scenes:**

1. Backend finds user by email: `admin@dreamxstore.com`
2. Uses `bcrypt.compare()` to verify password hash
3. Checks if user's role is `admin` or `superadmin` (regular users get 403 error)
4. Generates JWT token with user data:
   ```json
   {
     "userId": "507f1f77bcf86cd799439011",
     "role": "superadmin",
     "iat": 1735689600,
     "exp": 1738281600
   }
   ```
5. Returns token to browser

### JWT Token Structure

The JWT token contains:
```json
{
  "userId": "user_id_here",
  "role": "superadmin"
}
```

The `role` field is **crucial** for authorization on protected routes.

---

## Step 4: Authorization (Protecting Admin Routes)

### How It Works

When a superadmin tries to access a protected route, this happens:

**Example: Deleting a product**

1. Browser sends request with JWT token:
   ```bash
   DELETE /api/admin/products/123
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Backend runs `auth` middleware:
   - Extracts token from `Authorization` header
   - Verifies token signature
   - Finds user by `userId` in token
   - Attaches user object to `req.user`

3. Backend runs `authorize` middleware:
   - Checks if `req.user.role` is in allowed roles
   - If yes, proceeds to route handler
   - If no, returns 403 Forbidden

4. Route handler executes (deletes the product)

### Authorization Middleware

**File:** `middleware/authorize.js`

```javascript
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const roles = allowedRoles.flat();
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRole: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};
```

### Usage in Routes

```javascript
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Only superadmin can access
router.get('/users', auth, authorize('superadmin'), controller.getAllUsers);

// Either admin or superadmin can access
router.get('/stats', auth, authorize(['admin', 'superadmin']), controller.getStats);

// Multiple options
router.delete('/products/:id', auth, authorize('superadmin'), deleteProduct);
```

---

## Admin Routes

### 1. Admin Login

**POST** `/api/admin/login`

Login as admin/superadmin (also checks role).

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@dreamxstore.com", "password": "AdminPass@123"}'
```

---

### 2. Get All Users (Superadmin Only)

**GET** `/api/admin/users?page=1&limit=10&role=user`

Requires: `Authorization: Bearer <token>` + `superadmin` role

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "john_doe",
      "role": "user",
      "isVerified": true,
      "isBrand": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

### 3. Update User Role (Superadmin Only)

**PUT** `/api/admin/users/:userId/role`

Promote/demote a user to admin or superadmin.

Requires: `Authorization: Bearer <token>` + `superadmin` role

```bash
curl -X PUT http://localhost:3000/api/admin/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

**Request Body:**
```json
{
  "role": "admin"  // or "user" or "superadmin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "admin"
  }
}
```

---

### 4. Get Dashboard Statistics (Admin+)

**GET** `/api/admin/stats`

Get overview statistics.

Requires: `Authorization: Bearer <token>` + `admin` or `superadmin` role

```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalAdmins": 2,
    "totalBrands": 25,
    "verifiedUsers": 140,
    "unverifiedUsers": 10
  }
}
```

---

## Example: Protecting Product Routes

Here's how to protect product management routes:

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const productController = require('../controllers/product');

// Public route - anyone can view
router.get('/', productController.getAllProducts);

// Protected routes - superadmin only
router.post('/', 
  auth, 
  authorize('superadmin'), 
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

// For both admin and superadmin
router.get('/analytics/report', 
  auth, 
  authorize(['admin', 'superadmin']), 
  productController.getAnalytics
);

module.exports = router;
```

---

## Security Best Practices

1. **Never expose the seed script credentials** - Use environment variables for production
2. **Always use HTTPS** in production - Tokens are sensitive
3. **Rotate credentials regularly** - Especially if compromised
4. **Limit token expiration** - 30 days is reasonable; consider shorter for sensitive operations
5. **Keep JWT_SECRET secure** - Store in `.env` file, never commit to git
6. **Log admin actions** - Audit trail for compliance
7. **Implement rate limiting** - On login endpoint to prevent brute force
8. **Use strong passwords** - Enforce password requirements
9. **Two-factor authentication** - Consider adding for extra security
10. **Restrict IP addresses** - For admin panel (optional)

---

## Troubleshooting

### Issue: Superadmin already exists

The seed script checks if the superadmin already exists and skips creation if found. To re-run:

```bash
# Option 1: Delete the user from database manually (if needed)
# Option 2: Edit the seed script to use a different email
# Option 3: Use the admin panel to update the password
```

### Issue: Login returns 403 "Access denied"

This means the user exists but doesn't have `admin` or `superadmin` role. Use the superadmin to promote them:

```bash
curl -X PUT http://localhost:3000/api/admin/users/<userId>/role \
  -H "Authorization: Bearer <superadminToken>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Issue: Token is expired or invalid

The JWT token expires after 30 days. User must login again to get a new token.

### Issue: Authorization middleware not applied

Make sure the middleware order is correct:

```javascript
// CORRECT order
router.delete('/products/:id', 
  auth,              // First: authenticate
  authorize('superadmin'),  // Second: authorize
  handler            // Third: execute handler
);

// WRONG order
router.delete('/products/:id', 
  authorize('superadmin'),  // This will fail - user not authenticated yet!
  auth,
  handler
);
```

---

## Next Steps

1. **Run the seed script** to create the first superadmin
2. **Test the admin login** with the provided credentials
3. **Protect your admin routes** using the `auth` and `authorize` middleware
4. **Update the frontend** to send JWT tokens in requests
5. **Consider adding two-factor authentication** for extra security
6. **Set up admin panel** pages for managing users, products, etc.

---

## Summary

| Component | File | Purpose |
|-----------|------|---------|
| **Model** | `models/User.js` | Defines `role` field |
| **Seed Script** | `scripts/seedSuperadmin.js` | Creates first superadmin |
| **Auth Controller** | `controllers/auth.js` | Handles login, verification |
| **Admin Controller** | `controllers/admin.js` | Admin-specific operations |
| **Auth Middleware** | `middleware/auth.js` | Verifies JWT token |
| **Authorization Middleware** | `middleware/authorize.js` | Checks user role |
| **Admin Routes** | `routes/admin.js` | Admin endpoints |

---

## Questions?

Refer to this guide or check the inline comments in the source files for more details.
