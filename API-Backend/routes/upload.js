/**
 * Upload Routes
 * 
 * Handles image uploads via Cloudinary
 * These routes are reusable for any image uploads (products, brands, profiles, etc.)
 * 
 * All routes require authentication
 */

const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { uploadImage } = require('../utils/cloudinary');

const router = express.Router();

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
 * POST /api/upload/image
 * Generic image upload endpoint
 * Uploads image to Cloudinary and returns URL
 * 
 * Requires: Authentication
 * 
 * Body (multipart/form-data):
 *   - image (file): Image file to upload
 *   - folder (string): Optional. Cloudinary folder ('products', 'brands', etc.)
 *                      Default: 'general'
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Image uploaded successfully",
 *     data: {
 *       url: "https://res.cloudinary.com/...",
 *       publicId: "cloudinary-public-id"
 *     }
 *   }
 */
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const folder = req.body.folder || 'general';

    console.log('[uploadImage] Uploading file:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      folder: folder
    });

    // Upload to Cloudinary
    const result = await uploadImage(req.file.buffer, folder);

    console.log('[uploadImage] Upload successful:', {
      url: result.url,
      publicId: result.publicId
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });

  } catch (error) {
    console.error('[uploadImage] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/multiple
 * Upload multiple images at once
 * 
 * Requires: Authentication
 * 
 * Body (multipart/form-data):
 *   - images (files): Multiple image files
 *   - folder (string): Optional. Cloudinary folder
 *                      Default: 'general'
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Images uploaded successfully",
 *     data: [
 *       {
 *         url: "https://res.cloudinary.com/...",
 *         publicId: "cloudinary-public-id"
 *       },
 *       ...
 *     ]
 *   }
 */
router.post('/multiple', auth, upload.array('images', 10), async (req, res) => {
  try {
    // Validate files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const folder = req.body.folder || 'general';

    console.log('[uploadMultiple] Uploading files:', {
      count: req.files.length,
      folder: folder
    });

    // Upload all files in parallel
    const uploadPromises = req.files.map(file =>
      uploadImage(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    console.log('[uploadMultiple] Upload successful:', {
      count: results.length
    });

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: results
    });

  } catch (error) {
    console.error('[uploadMultiple] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Images upload failed',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/product
 * Upload product images
 * Convenience endpoint specifically for products
 * 
 * Requires: Authentication
 * 
 * Body (multipart/form-data):
 *   - images (files): Product image files (up to 10)
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Product images uploaded successfully",
 *     data: [{ url, publicId }, ...]
 *   }
 */
router.post('/product', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product images provided'
      });
    }

    console.log('[uploadProduct] Uploading product images:', {
      count: req.files.length
    });

    // Upload all product images in parallel to 'products' folder
    const uploadPromises = req.files.map(file =>
      uploadImage(file.buffer, 'products')
    );

    const results = await Promise.all(uploadPromises);

    console.log('[uploadProduct] Upload successful:', {
      count: results.length
    });

    res.json({
      success: true,
      message: 'Product images uploaded successfully',
      data: results
    });

  } catch (error) {
    console.error('[uploadProduct] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Product images upload failed',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/brand
 * Upload brand profile image
 * Convenience endpoint specifically for brands
 * 
 * Requires: Authentication
 * 
 * Body (multipart/form-data):
 *   - image (file): Brand profile image
 * 
 * Response:
 *   {
 *     success: true,
 *     message: "Brand image uploaded successfully",
 *     data: { url, publicId }
 *   }
 */
router.post('/brand', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No brand image provided'
      });
    }

    console.log('[uploadBrand] Uploading brand image:', {
      filename: req.file.originalname,
      size: req.file.size
    });

    // Upload brand image to 'brands' folder
    const result = await uploadImage(req.file.buffer, 'brands');

    console.log('[uploadBrand] Upload successful:', {
      url: result.url,
      publicId: result.publicId
    });

    res.json({
      success: true,
      message: 'Brand image uploaded successfully',
      data: result
    });

  } catch (error) {
    console.error('[uploadBrand] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Brand image upload failed',
      error: error.message
    });
  }
});

module.exports = router;
