const Product = require('../models/Product');
const Brand = require('../models/Brand');
const productRepository = require('../repositories/productRepository');

const productController = {
  /**
   * Create a new product
   */
  async createProduct(req, res) {
    try {
      const {
        name,
        description,
        longDescription,
        brandId,
        brandName,
        category,
        subCategory,
        price,
        originalPrice,
        discount,
        stockQuantity,
        sizes,
        sizeStock,
        hasSizes,
        features,
        tags,
        images,
      } = req.body;

      console.log('[createProduct] Received data:', {
        name,
        category,
        brandId,
        brandName,
        price,
        imagesCount: images?.length,
        hasSizes,
      });

      // Validate brand exists
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found',
        });
      }

      // Create product
      const product = new Product({
        name,
        description,
        longDescription,
        brandId,
        brandName,
        category,
        subCategory,
        price,
        originalPrice,
        discount,
        stockQuantity,
        sizes: hasSizes ? sizes : [],
        sizeStock: hasSizes ? sizeStock : { 'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, 'XXXL': 0 },
        hasSizes: hasSizes || true,
        features,
        tags,
        images,
        inStock: stockQuantity > 0,
      });

      await product.save();
      console.log('[createProduct] Product created:', product._id);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      console.error('[createProduct] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message,
      });
    }
  },

  /**
   * Get all products with pagination and filters
   */
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 20, category, search, sortBy = 'createdAt' } = req.query;
      const { featured, maxPrice, minPrice } = req.query;

      console.log('[getProducts] Query params:', {
        page,
        limit,
        category,
        search,
        sortBy,
        featured,
        minPrice,
        maxPrice,
      });

      const { products, total } = await productRepository.getProducts({
        category,
        featured: featured === 'true',
        limit,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        page,
        search,
        sortBy,
      });

      console.log('[getProducts] Found products:', products.length);

      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('[getProducts] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message,
      });
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(req, res) {
    try {
      const { productId } = req.params;

      console.log('[getProductById] ID:', productId);

      const product = await productRepository.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('[getProductById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message,
      });
    }
  },

  /**
   * Update product
   */
  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = req.body;

      console.log('[updateProduct] ID:', productId);
      console.log('[updateProduct] Update data keys:', Object.keys(updateData));

      // Validate brand if being updated
      if (updateData.brandId) {
        const brand = await Brand.findById(updateData.brandId);
        if (!brand) {
          return res.status(404).json({
            success: false,
            message: 'Brand not found',
          });
        }
      }

      const product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      }).populate('brandId', 'brandName');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.log('[updateProduct] Product updated:', product._id);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      console.error('[updateProduct] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message,
      });
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(req, res) {
    try {
      const { productId } = req.params;

      console.log('[deleteProduct] ID:', productId);

      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      console.log('[deleteProduct] Product deleted:', product._id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
        data: { id: product._id },
      });
    } catch (error) {
      console.error('[deleteProduct] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message,
      });
    }
  },

  /**
   * Toggle product active status
   */
  async toggleProductStatus(req, res) {
    try {
      const { productId } = req.params;

      console.log('[toggleProductStatus] ID:', productId);

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      product.isActive = !product.isActive;
      await product.save();

      console.log('[toggleProductStatus] Status updated:', product.isActive);

      res.json({
        success: true,
        message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
        data: product,
      });
    } catch (error) {
      console.error('[toggleProductStatus] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling product status',
        error: error.message,
      });
    }
  },
};

module.exports = productController;
