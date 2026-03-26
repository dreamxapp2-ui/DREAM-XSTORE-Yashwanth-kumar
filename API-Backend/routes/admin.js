/**
 * Admin Routes
 * 
 * All these routes require authentication and admin role.
 * The auth middleware extracts the user from the JWT token.
 * The authorize middleware checks if the user has the required role.
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const adminController = require('../controllers/admin');
const productController = require('../controllers/productController');
const bannerController = require('../controllers/bannerController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Configure multer for file uploads (store in memory as Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/admin/brand-login
 * Brand login (checks brand name, email, and password)
 * Public endpoint - no authentication required
 * 
 * Body:
 *   - brandName (string): brand name
 *   - ownerEmail (string): brand owner email
 *   - password (string): brand password
 * 
 * Response:
 *   {
 *     success: true,
 *     token: "jwt_token",
 *     brand: { id, brandName, ownerEmail, status, ... }
 *   }
 */
router.post('/brand-login', adminController.brandLogin);
router.get('/public/brands', adminController.getBrands);

/**
 * POST /api/admin/login
 * Admin login (checks role)
 * 
 * Body:
 *   - email (string): admin email
 *   - password (string): admin password
 * 
 * Response:
 *   {
 *     success: true,
 *     token: "jwt_token",
 *     user: { id, email, username, role, ... }
 *   }
 */
router.post('/login', adminController.adminLogin);

/**
 * Get all users (paginated)
 * Requires: Authentication + superadmin role
 * 
 * Query params:
 *   - page (number): page number (default: 1)
 *   - limit (number): items per page (default: 10)
 *   - role (string): filter by role (optional)
 * 
 * Response:
 *   {
 *     success: true,
 *     data: [user1, user2, ...],
 *     pagination: { total, page, limit, pages }
 *   }
 */
router.get('/users', auth, authorize('superadmin'), adminController.getAllUsers);

/**
 * PUT /api/admin/users/:userId/role
 * Update user role (promote/demote)
 * Requires: Authentication + superadmin role
 * 
 * Params:
 *   - userId (string): ID of user to update
 * 
 * Body:
 *   - role (string): new role ('user', 'admin', or 'superadmin')
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "User role updated to admin",
 *     user: { id, email, role, ... }
 *   }
 */
router.put('/users/:userId/role', auth, authorize('superadmin'), adminController.updateUserRole);

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 * Requires: Authentication + admin or superadmin role
 * 
 * Response:
 *   {
 *     success: true,
 *     stats: {
 *       totalUsers: 100,
 *       totalAdmins: 2,
 *       totalBrands: 15,
 *       verifiedUsers: 95,
 *       unverifiedUsers: 5
 *     }
 *   }
 */
router.get('/stats', auth, authorize(['admin', 'superadmin']), adminController.getDashboardStats);

/**
 * GET /api/admin/dashboard/stats
 * Get comprehensive dashboard data
 * Requires: Authentication + admin or superadmin role
 * 
 * Response:
 *   {
 *     success: true,
 *     totalUsers: 100,
 *     totalOrders: 50,
 *     totalBrands: 15,
 *     totalRevenue: 50000,
 *     revenueChange: 5,
 *     ordersChange: 3,
 *     brandsChange: 0,
 *     usersChange: 2
 *   }
 */
router.get('/dashboard/stats', auth, authorize(['admin', 'superadmin']), adminController.getDashboardData);

/**
 * GET /api/admin/dashboard/recent-orders
 * Get recent orders for dashboard
 * Requires: Authentication + admin or superadmin role
 * 
 * Query params:
 *   - limit (number): number of recent orders (default: 5)
 * 
 * Response:
 *   {
 *     success: true,
 *     data: [
 *       {
 *         id: "orderId",
 *         customerName: "John Doe",
 *         customerEmail: "john@email.com",
 *         total: 5000,
 *         status: "pending"
 *       }
 *     ]
 *   }
 */
router.get('/dashboard/recent-orders', auth, authorize(['admin', 'superadmin']), adminController.getRecentOrders);

/**
 * GET /api/admin/dashboard/recent-brands
 * Get recent brands for dashboard
 * Requires: Authentication + admin or superadmin role
 * 
 * Query params:
 *   - limit (number): number of recent brands (default: 5)
 * 
 * Response:
 *   {
 *     success: true,
 *     data: [
 *       {
 *         id: "brandId",
 *         name: "Brand Name",
 *         ownerEmail: "owner@email.com",
 *         status: "active"
 *       }
 *     ]
 *   }
 */
router.get('/dashboard/recent-brands', auth, authorize(['admin', 'superadmin']), adminController.getRecentBrands);

/**
 * GET /api/admin/brands
 * Get all brands with pagination
 * Requires: Authentication + admin or superadmin role
 */
router.get('/brands', auth, authorize(['admin', 'superadmin']), adminController.getBrands);

/**
 * POST /api/admin/brands
 * Create a new brand account
 * Requires: Authentication + admin or superadmin role
 * 
 * Body:
 *   - brandName (string): name of the brand
 *   - ownerEmail (string): owner's email
 *   - password (string): account password
 *   - confirmPassword (string): password confirmation
 *   - pickupLocation (string): pickup location name
 *   - pincode (string): postal code
 *   - phone (string): contact phone number
 *   - address (string): full address
 *   - city (string): city name
 *   - state (string): state name
 *   - country (string): country name (default: India)
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Brand account created successfully",
 *     brand: { id, brandName, ownerEmail, status, createdAt }
 *   }
 */
router.post('/brands', auth, authorize(['admin', 'superadmin']), adminController.createBrand);

/**
 * POST /api/admin/brands/:brandId/approve
 * Approve a brand
 * Requires: Authentication + admin or superadmin role
 */
router.post('/brands/:brandId/approve', auth, authorize(['admin', 'superadmin']), adminController.approveBrand);

/**
 * PATCH /api/admin/brands/:brandId
 * Update brand profile (description, profile image, etc.)
 * Supports both JSON and FormData (multipart)
 * Requires: Authentication + admin or superadmin role
 */
router.patch('/brands/:brandId', auth, authorize(['admin', 'superadmin']), adminController.updateBrandProfile);

/**
 * POST /api/admin/brands/:brandId/upload
 * Upload brand profile image
 * Requires: Authentication + admin or superadmin role
 */
router.post('/brands/:brandId/upload', auth, authorize(['admin', 'superadmin']), upload.single('profileImage'), adminController.updateBrandProfile);

/**
 * POST /api/admin/brands/:brandId/reject
 * Reject a brand
 * Requires: Authentication + admin or superadmin role
 */
router.post('/brands/:brandId/reject', auth, authorize(['admin', 'superadmin']), adminController.rejectBrand);

/**
 * DELETE /api/admin/brands/:brandId
 * Delete a brand account
 * Requires: Authentication + admin or superadmin role
 */
router.delete('/brands/:brandId', auth, authorize(['admin', 'superadmin']), adminController.deleteBrand);

/**
 * GET /api/admin/brands/:brandId
 * Get brand details by ID
 * Requires: Authentication + admin or superadmin role
 */
router.get('/brands/:brandId', auth, authorize(['admin', 'superadmin']), adminController.getBrandById);

/**
 * PATCH /api/admin/brands/:brandId/status
 * Update brand status
 * Requires: Authentication + admin or superadmin role
 */
router.patch('/brands/:brandId/status', auth, authorize(['admin', 'superadmin']), adminController.updateBrandStatus);

/**
 * GET /api/admin/products
 * Get all products with pagination
 * Requires: Authentication + admin or superadmin role
 */
router.get('/products', auth, authorize(['admin', 'superadmin']), adminController.getProducts);

/**
 * DELETE /api/admin/products/:productId
 * Delete a product
 * Requires: Authentication + admin or superadmin role
 */
router.delete('/products/:productId', auth, authorize(['admin', 'superadmin']), productController.deleteProduct);

/**
 * POST /api/admin/products/:productId/approve
 * Approve a product
 * Requires: Authentication + admin or superadmin role
 */
router.post('/products/:productId/approve', auth, authorize(['admin', 'superadmin']), adminController.approveProduct);

/**
 * POST /api/admin/products/:productId/reject
 * Reject a product
 * Requires: Authentication + admin or superadmin role
 */
router.post('/products/:productId/reject', auth, authorize(['admin', 'superadmin']), adminController.rejectProduct);

/**
 * GET /api/admin/orders
 * Get all orders with pagination
 * Requires: Authentication + admin or superadmin role
 */
router.get('/orders', auth, authorize(['admin', 'superadmin']), adminController.getOrders);

/**
 * GET /api/admin/customers
 * Get all customers with pagination
 * Requires: Authentication + admin or superadmin role
 */
router.get('/customers', auth, authorize(['admin', 'superadmin']), adminController.getCustomers);

/**
 * PATCH /api/admin/customers/:customerId/status
 * Update customer status
 * Requires: Authentication + admin or superadmin role
 */
router.patch('/customers/:customerId/status', auth, authorize(['admin', 'superadmin']), adminController.updateCustomerStatus);

/**
 * GET /api/admin/analytics
 * Get analytics data
 * Requires: Authentication + admin or superadmin role
 */
router.get('/analytics', auth, authorize(['admin', 'superadmin']), adminController.getAnalytics);

/**
 * GET /api/admin/settings
 * Get platform settings
 * Requires: Authentication + admin or superadmin role
 */
router.get('/settings', auth, authorize(['admin', 'superadmin']), adminController.getSettings);

/**
 * PUT /api/admin/settings
 * Update platform settings
 * Requires: Authentication + superadmin role
 */
router.put('/settings', auth, authorize('superadmin'), adminController.updateSettings);

/**
 * PATCH /api/admin/customers/:userId/brand
 * Make a customer a brand
 * Requires: Authentication + admin or superadmin role
 */
router.patch('/customers/:userId/brand', auth, authorize(['admin', 'superadmin']), adminController.makeUserBrand);

/**
 * PATCH /api/admin/customers/:userId/revoke-brand
 * Revoke brand status from a customer
 * Requires: Authentication + admin or superadmin role
 */
router.patch('/customers/:userId/revoke-brand', auth, authorize(['admin', 'superadmin']), adminController.revokeBrandStatus);

/**
 * GET /api/admin/banners
 * Get all banners
 * Requires: Authentication + admin or superadmin role
 */
router.get('/banners', auth, authorize(['admin', 'superadmin']), bannerController.getAllBanners);

/**
 * POST /api/admin/banners
 * Create a new banner
 * Requires: Authentication + admin or superadmin role
 */
router.post('/banners', auth, authorize(['admin', 'superadmin']), bannerController.createBanner);

/**
 * PUT /api/admin/banners/:id
 * Update a banner
 * Requires: Authentication + admin or superadmin role
 */
router.put('/banners/:id', auth, authorize(['admin', 'superadmin']), bannerController.updateBanner);

/**
 * DELETE /api/admin/banners/:id
 * Delete a banner
 * Requires: Authentication + admin or superadmin role
 */
router.delete('/banners/:id', auth, authorize(['admin', 'superadmin']), bannerController.deleteBanner);

/**
 * PUT /api/admin/banners/:id/toggle
 * Toggle banner active status
 * Requires: Authentication + admin or superadmin role
 */
router.put('/banners/:id/toggle', auth, authorize(['admin', 'superadmin']), bannerController.toggleBanner);

module.exports = router;
