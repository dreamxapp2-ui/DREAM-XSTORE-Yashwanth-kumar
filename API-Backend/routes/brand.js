/**
 * Brand Routes
 * Routes for brand-specific operations (profile management, dashboard data, etc.)
 * All routes require brand authentication via brandAuth middleware
 */

const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand');
const brandAuth = require('../middleware/brandAuth');
const multer = require('multer');

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
 * GET /api/brand/profile
 * Get current brand's profile
 * Requires: Brand authentication
 * 
 * Response:
 *   {
 *     success: true,
 *     data: { id, brandName, ownerEmail, description, profileImage, ... }
 *   }
 */
router.get('/profile', brandAuth, brandController.getProfile);

/**
 * PATCH /api/brand/profile
 * Update brand profile (description, profile image, social links, etc.)
 * Requires: Brand authentication
 * 
 * Body:
 *   - description (string, optional): Brand description
 *   - instagram (string, optional): Instagram URL
 *   - facebook (string, optional): Facebook URL
 *   - twitter (string, optional): Twitter URL
 *   - profileImage (object, optional): { url: string, publicId: string }
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Brand profile updated successfully",
 *     data: { ... updated brand data ... }
 *   }
 */
router.patch('/profile', brandAuth, brandController.updateProfile);

/**
 * POST /api/brand/profile/upload
 * Upload brand profile image
 * Requires: Brand authentication
 * 
 * Body (multipart/form-data):
 *   - description (string, optional): Brand description
 *   - instagram (string, optional): Instagram URL
 *   - facebook (string, optional): Facebook URL
 *   - twitter (string, optional): Twitter URL
 *   - file (file): Brand profile image
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Brand profile updated successfully",
 *     data: { ... updated brand data ... }
 *   }
 */
router.post('/profile/upload', brandAuth, upload.single('file'), brandController.updateProfile);

/**
 * POST /api/brand/products
 * Create a new product for the brand
 * Requires: Brand authentication
 * 
 * Body:
 *   - name (string): Product name
 *   - description (string): Short description
 *   - longDescription (string): Long description
 *   - category (string): Product category
 *   - subCategory (string): Sub category
 *   - price (number): Sale price
 *   - originalPrice (number): Original price
 *   - discount (number): Discount percentage
 *   - stockQuantity (number): Total stock
 *   - sizes (array): Available sizes
 *   - sizeStock (object): Stock for each size
 *   - hasSizes (boolean): Whether product has sizes
 *   - features (array): Product features
 *   - tags (array): Product tags
 *   - images (array): Product image URLs
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Product created successfully",
 *     data: { ... product data ... }
 *   }
 */
router.post('/products', brandAuth, brandController.createProduct);

module.exports = router;
