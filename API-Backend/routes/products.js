const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * Admin Routes - Require authentication and admin/superadmin role
 */

// Create product (admin only)
router.post(
  '/products',
  auth,
  authorize(['admin', 'superadmin']),
  productController.createProduct
);

// Get all products (admin only)
router.get(
  '/products',
  auth,
  authorize(['admin', 'superadmin']),
  productController.getProducts
);

// Get product by ID (admin only)
router.get(
  '/products/:productId',
  auth,
  authorize(['admin', 'superadmin']),
  productController.getProductById
);

// Update product (admin only)
router.put(
  '/products/:productId',
  auth,
  authorize(['admin', 'superadmin']),
  productController.updateProduct
);

// Delete product (admin only)
router.delete(
  '/products/:productId',
  auth,
  authorize(['admin', 'superadmin']),
  productController.deleteProduct
);

// Toggle product active status (admin only)
router.patch(
  '/products/:productId/status',
  auth,
  authorize(['admin', 'superadmin']),
  productController.toggleProductStatus
);

/**
 * Public Routes - No authentication required
 */

// Get all products (public)
router.get('/', productController.getProducts);

// Get product by ID (public)
router.get('/:productId', productController.getProductById);

module.exports = router;
