/**
 * Admin Controller
 * 
 * Handles admin-specific operations and authentication
 * Only superadmins and admins should access these routes
 */

const User = require('../models/User');
const Brand = require('../models/Brand');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

const adminController = {
  /**
   * Brand Login
   * 
   * This endpoint authenticates brand users by checking ownerEmail and password
   * against the Brand collection.
   */
  async brandLogin(req, res) {
    try {
      const { brandName, ownerEmail, password } = req.body;

      // Input validation
      if (!brandName || !ownerEmail || !password) {
        return res.status(400).json({
          success: false,
          message: 'Brand name, email, and password are required',
          field: 'general'
        });
      }

      // Find brand by brandName and ownerEmail
      const brand = await Brand.findOne({
        brandName: brandName.trim(),
        ownerEmail: ownerEmail.toLowerCase().trim()
      });

      if (!brand) {
        return res.status(401).json({
          success: false,
          message: 'Invalid brand name, email, or password',
          field: 'credentials'
        });
      }

      // Check brand status
      if (brand.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: `Brand account is ${brand.status.toLowerCase()}. Please contact support.`,
          field: 'general'
        });
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, brand.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid brand name, email, or password',
          field: 'password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { brandId: brand._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Brand login successful',
        token,
        brand: {
          id: brand._id,
          brandName: brand.brandName,
          ownerEmail: brand.ownerEmail,
          status: brand.status,
          profileImage: brand.profileImage
        }
      });

    } catch (error) {
      console.error('Brand login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        field: 'general',
        error: error.message
      });
    }
  },

  /**
   * Admin Login (with role check)
   * 
   * This endpoint is specifically for admin/superadmin users.
   * If a regular user tries to login here, they get an error.
   */
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          field: 'general'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          field: 'email'
        });
      }

      // Check if user is an admin or superadmin
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only admins can login here.',
          field: 'general'
        });
      }

      // Check if verified
      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in.',
          field: 'general'
        });
      }

      // Compare password
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Please login using your original method',
          field: 'password'
        });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          field: 'password'
        });
      }

      // Generate JWT token with role
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: userResponse._id,
          email: userResponse.email,
          username: userResponse.username,
          role: userResponse.role,
          firstName: userResponse.firstName,
          lastName: userResponse.lastName
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        field: 'general',
        error: error.message
      });
    }
  },

  /**
   * Get all users (admin only)
   * Only superadmin can access this
   */
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (role) {
        filter.role = role;
      }

      // Get users and total count
      const users = await User.find(filter)
        .select('-password -verificationToken -verificationTokenExpiry')
        .limit(limit * 1)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  },

  /**
   * Update user role (superadmin only)
   * 
   * This allows the superadmin to promote/demote users to admin role
   */
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['user', 'admin', 'superadmin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: user, admin, superadmin'
        });
      }

      // Prevent self-demotion
      if (req.user._id.toString() === userId && role !== 'superadmin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote yourself from superadmin'
        });
      }

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password -verificationToken -verificationTokenExpiry');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User role updated to ${role}`,
        user
      });

    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role',
        error: error.message
      });
    }
  },

/**
   * Get dashboard statistics (admin only)
   */
  async getDashboardStats(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
      const totalBrands = await User.countDocuments({ isBrand: true });
      const verifiedUsers = await User.countDocuments({ isVerified: true });

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalAdmins,
          totalBrands,
          verifiedUsers,
          unverifiedUsers: totalUsers - verifiedUsers
        }
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message
      });
    }
  },

  /**
   * Get dashboard data with all stats
   * Returns: totalUsers, totalOrders, totalBrands, totalRevenue, and changes
   */
  async getDashboardData(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
      const totalBrands = await Brand.countDocuments();
      const verifiedUsers = await User.countDocuments({ isVerified: true });

      // Get orders count (if Order model exists)
      let totalOrders = 0;
      try {
        const Order = require('../models/Order');
        totalOrders = await Order.countDocuments();
      } catch (e) {
        totalOrders = 0;
      }

      // Return dashboard stats with 0 values for empty data
      res.json({
        success: true,
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalBrands: totalBrands || 0,
        totalRevenue: 0, // Would need order data
        revenueChange: 0,
        ordersChange: 0,
        brandsChange: 0,
        usersChange: 0,
        verifiedUsers: verifiedUsers || 0,
        unverifiedUsers: (totalUsers || 0) - (verifiedUsers || 0)
      });

    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      });
    }
  },

  /**
   * Get recent orders for dashboard
   */
  async getRecentOrders(req, res) {
    try {
      const { limit = 5 } = req.query;
      const Order = require('../models/Order');

      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('customer')
        .exec();

      const recentOrders = orders.map(order => ({
        id: order._id,
        customerName: order.customer?.username || 'Unknown',
        customerEmail: order.customer?.email || 'unknown@email.com',
        total: order.totalAmount || 0,
        status: order.status || 'pending'
      }));

      res.json({
        success: true,
        data: recentOrders || []
      });

    } catch (error) {
      console.error('Recent orders error:', error);
      // Return empty array if Order model doesn't exist
      res.json({
        success: true,
        data: []
      });
    }
  },

  /**
   * Get recent brands for dashboard
   */
  async getRecentBrands(req, res) {
    try {
      const { limit = 5 } = req.query;

      const brands = await Brand.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('_id brandName ownerEmail status')
        .exec();

      const recentBrands = brands.map(brand => ({
        id: brand._id,
        name: brand.brandName,
        ownerEmail: brand.ownerEmail,
        email: brand.ownerEmail,
        status: brand.status || 'Pending'
      }));

      res.json({
        success: true,
        data: recentBrands || []
      });

    } catch (error) {
      console.error('Recent brands error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  },

  /**
   * Get all brands with pagination
   */
  async getBrands(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      console.log('[getBrands] Query params:', { page, limit, status });
      console.log('[getBrands] User:', req.user?.id, 'Role:', req.user?.role);

      const filter = {};
      if (status) filter.status = status;

      console.log('[getBrands] Filter:', filter);

      const brands = await Brand.find(filter)
        .select('brandName ownerEmail city state status productCount commissionRate description profileImage profileImageContentType followerCount socialLinks createdAt')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

      console.log('[getBrands] Found brands:', brands.length);

      const total = await Brand.countDocuments(filter);
      console.log('[getBrands] Total brands:', total);

      const formattedBrands = brands.map(brand => ({
        id: brand._id,
        name: brand.brandName,
        ownerEmail: brand.ownerEmail,
        location: brand.city + ', ' + brand.state,
        status: brand.status,
        productCount: brand.productCount,
        commissionRate: brand.commissionRate,
        description: brand.description,
        profileImage: brand.profileImage,
        profileImageContentType: brand.profileImageContentType,
        followerCount: brand.followerCount,
        socialLinks: brand.socialLinks || {},
        createdAt: brand.createdAt
      }));

      console.log('[getBrands] Sample brand data:', brands[0] ? {
        name: brands[0].brandName,
        hasProfileImage: !!brands[0].profileImage,
        profileImageSize: brands[0].profileImage ? brands[0].profileImage.length : 0,
        contentType: brands[0].profileImageContentType
      } : 'No brands');

      console.log('[getBrands] Formatted brands:', formattedBrands);

      res.json({
        success: true,
        data: formattedBrands,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching brands',
        error: error.message
      });
    }
  },

  /**
   * Approve brand
   */
  async approveBrand(req, res) {
    try {
      const { brandId } = req.params;

      // Since there's no brandStatus field, just return success
      const brand = await User.findById(brandId);

      if (!brand || !brand.isBrand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        message: 'Brand approved',
        data: brand
      });
    } catch (error) {
      console.error('Approve brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving brand',
        error: error.message
      });
    }
  },

  /**
   * Get brand by ID
   */
  async getBrandById(req, res) {
    try {
      const { brandId } = req.params;

      const brand = await Brand.findById(brandId).select('-password');

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: brand._id,
          brandName: brand.brandName,
          ownerEmail: brand.ownerEmail,
          location: brand.city + ', ' + brand.state,
          status: brand.status,
          productCount: brand.productCount,
          commissionRate: brand.commissionRate,
          phone: brand.phone,
          address: brand.address,
          pickupLocation: brand.pickupLocation,
          country: brand.country,
          createdAt: brand.createdAt
        }
      });

    } catch (error) {
      console.error('Get brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching brand',
        error: error.message
      });
    }
  },

  /**
   * Delete a brand account
   * Admin can delete any brand
   */
  async deleteBrand(req, res) {
    try {
      const { brandId } = req.params;

      const brand = await Brand.findByIdAndDelete(brandId);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        message: `Brand ${brand.brandName} deleted successfully`,
        brandId: brand._id
      });

    } catch (error) {
      console.error('Delete brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting brand',
        error: error.message
      });
    }
  },

  /**
   * Update brand status
   */
  async updateBrandStatus(req, res) {
    try {
      const { brandId } = req.params;
      const { status } = req.body;

      const validStatuses = ['Active', 'Pending', 'Suspended', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: Active, Pending, Suspended, Rejected'
        });
      }

      const brand = await Brand.findByIdAndUpdate(
        brandId,
        { status },
        { new: true }
      ).select('-password');

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        message: `Brand status updated to ${status}`,
        data: brand
      });

    } catch (error) {
      console.error('Update brand status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating brand status',
        error: error.message
      });
    }
  },

  /**
   * Update brand profile (description, profile image, social links, etc.)
   */
  async updateBrandProfile(req, res) {
    try {
      const { brandId } = req.params;
      const { description, instagram, facebook, twitter, profileImage } = req.body;
      
      console.log('[updateBrandProfile] Params:', { brandId });
      console.log('[updateBrandProfile] Full Body:', req.body);
      console.log('[updateBrandProfile] Extracted:', { description, instagram, facebook, twitter, profileImage });
      console.log('[updateBrandProfile] File:', req.file ? { filename: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : 'undefined');

      // Build update object
      const updateData = {};
      
      // Update description if provided
      if (description !== undefined && description !== null) {
        updateData.description = description.trim();
      }
      
      // Handle image from request body (Cloudinary URL sent from frontend)
      if (profileImage) {
        console.log('[updateBrandProfile] profileImage received:', profileImage);
        console.log('[updateBrandProfile] profileImage is string?', typeof profileImage === 'string');
        
        let imageData = profileImage;
        // If profileImage is a JSON string, parse it
        if (typeof profileImage === 'string') {
          try {
            imageData = JSON.parse(profileImage);
            console.log('[updateBrandProfile] Parsed profileImage:', imageData);
          } catch (e) {
            console.log('[updateBrandProfile] Could not parse profileImage as JSON');
          }
        }
        
        if (imageData && imageData.url && imageData.publicId) {
          console.log('[updateBrandProfile] Setting profileImage in updateData:', imageData);
          updateData.profileImage = imageData;
        } else {
          console.warn('[updateBrandProfile] profileImage missing url or publicId:', imageData);
        }
      } else {
        console.log('[updateBrandProfile] profileImage not provided');
      }
      
      // Handle image file - upload to Cloudinary
      if (req.file) {
        try {
          console.log('[updateBrandProfile] Uploading image to Cloudinary...');
          const uploadResult = await uploadImage(req.file.buffer, 'brands', `brand-${brandId}`);
          console.log('[updateBrandProfile] Cloudinary upload successful:', uploadResult);
          
          // Delete old image if it exists
          const existingBrand = await Brand.findById(brandId);
          if (existingBrand && existingBrand.profileImage && existingBrand.profileImage.publicId) {
            console.log('[updateBrandProfile] Deleting old image:', existingBrand.profileImage.publicId);
            await deleteImage(existingBrand.profileImage.publicId).catch(err => {
              console.error('[updateBrandProfile] Error deleting old image:', err);
            });
          }
          
          updateData.profileImage = {
            url: uploadResult.url,
            publicId: uploadResult.publicId
          };
        } catch (uploadError) {
          console.error('[updateBrandProfile] Cloudinary upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: uploadError.message
          });
        }
      }

      // Update social links
      const socialLinks = {};
      if (instagram !== undefined && instagram !== null) {
        socialLinks.instagram = instagram.trim() || null;
      }
      if (facebook !== undefined && facebook !== null) {
        socialLinks.facebook = facebook.trim() || null;
      }
      if (twitter !== undefined && twitter !== null) {
        socialLinks.twitter = twitter.trim() || null;
      }
      
      // Only set socialLinks if we have any updates
      if (Object.keys(socialLinks).length > 0) {
        updateData.socialLinks = socialLinks;
      }

      console.log('[updateBrandProfile] Update data keys:', Object.keys(updateData));
      console.log('[updateBrandProfile] Final updateData being sent to MongoDB:', JSON.stringify(updateData, null, 2));

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data to update'
        });
      }

      const brand = await Brand.findByIdAndUpdate(
        brandId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      console.log('[updateBrandProfile] After DB update - brand profileImage:', brand.profileImage);
      console.log('[updateBrandProfile] After DB update - brand.profileImage.url:', brand.profileImage?.url);
      console.log('[updateBrandProfile] After DB update - brand.profileImage.publicId:', brand.profileImage?.publicId);

      res.json({
        success: true,
        message: 'Brand profile updated successfully',
        data: brand
      });
    } catch (error) {
      console.error('Update brand profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating brand profile',
        error: error.message
      });
    }
  },

  /**
   * Reject brand
   */
  async rejectBrand(req, res) {
    try {
      const { brandId } = req.params;
      const { reason } = req.body;

      const brand = await Brand.findByIdAndUpdate(
        brandId,
        { status: 'Rejected' },
        { new: true }
      ).select('-password');

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        message: 'Brand rejected successfully',
        data: brand
      });

    } catch (error) {
      console.error('Reject brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting brand',
        error: error.message
      });
    }
  },

  /**
   * Get all products with pagination
   */
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (status) filter.status = status;

      let Product;
      try {
        Product = require('../models/Product');
      } catch (e) {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 20, pages: 0 }
        });
      }

      const products = await Product.find(filter)
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments(filter);

      const formattedProducts = products.map(product => ({
        id: product._id,
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        discount: product.discount || 0,
        brandId: product.brandId,
        brand: product.brandName,
        category: product.category || 'Uncategorized',
        images: product.images || [],
        stockQuantity: product.stockQuantity || 0,
        inStock: product.inStock || false,
        hasSizes: product.hasSizes || false,
        sizes: product.sizes || [],
        sizeStock: product.sizeStock || {},
        isFeatured: product.isFeatured || false,
        isActive: product.isActive || true,
        weight: product.weight || null,
        length: product.length || null,
        breadth: product.breadth || null,
        height: product.height || null,
        createdAt: product.createdAt
      }));

      res.json({
        success: true,
        data: formattedProducts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  },

  /**
   * Approve product
   */
  async approveProduct(req, res) {
    try {
      const { productId } = req.params;
      const Product = require('../models/Product');

      const product = await Product.findByIdAndUpdate(
        productId,
        { status: 'active' },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product approved',
        data: product
      });
    } catch (error) {
      console.error('Approve product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving product',
        error: error.message
      });
    }
  },

  /**
   * Reject product
   */
  async rejectProduct(req, res) {
    try {
      const { productId } = req.params;
      const { reason } = req.body;
      const Product = require('../models/Product');

      const product = await Product.findByIdAndUpdate(
        productId,
        { status: 'rejected', rejectionReason: reason },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product rejected',
        data: product
      });
    } catch (error) {
      console.error('Reject product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting product',
        error: error.message
      });
    }
  },

  /**
   * Get all orders with pagination
   */
  async getOrders(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (status) filter.status = status;

      let Order;
      try {
        Order = require('../models/Order');
      } catch (e) {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 20, pages: 0 }
        });
      }

      const orders = await Order.find(filter)
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate('customer')
        .populate('brand');

      const total = await Order.countDocuments(filter);

      const formattedOrders = orders.map(order => ({
        id: order._id,
        customerId: order.customer?._id || '',
        customerName: order.customer?.username || 'Unknown',
        customerEmail: order.customer?.email || 'unknown@email.com',
        brandId: order.brand?._id || '',
        brandName: order.brand?.username || 'Unknown Brand',
        items: order.items || [],
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        total: order.totalAmount || 0,
        platformCommission: 0,
        brandPayout: 0,
        orderStatus: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        shippingAddress: order.shippingAddress || {},
        createdAt: order.createdAt
      }));

      res.json({
        success: true,
        data: formattedOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        error: error.message
      });
    }
  },

  /**
   * Get all customers with pagination
   */
  async getCustomers(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      // Show all users (both brands and non-brands)
      const filter = {};
      if (status) filter.status = status;

      const customers = await User.find(filter)
        .select('-password -verificationToken')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      const formattedCustomers = customers.map(customer => ({
        id: customer._id,
        email: customer.email,
        firstName: customer.firstName || 'User',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        avatar: customer.avatar || '',
        status: customer.status || 'active',
        isBrand: customer.isBrand || false,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: customer.createdAt
      }));

      res.json({
        success: true,
        data: formattedCustomers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching customers',
        error: error.message
      });
    }
  },

  /**
   * Update customer status
   */
  async updateCustomerStatus(req, res) {
    try {
      const { customerId } = req.params;
      const { status } = req.body;

      const customer = await User.findByIdAndUpdate(
        customerId,
        { status },
        { new: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        message: `Customer status updated to ${status}`,
        data: customer
      });
    } catch (error) {
      console.error('Update customer status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating customer status',
        error: error.message
      });
    }
  },

  /**
   * Get analytics data
   */
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Calculate sales data
      const totalSales = 0;
      const conversionRate = 3.2;
      const avgOrderValue = 2450;

      res.json({
        success: true,
        data: {
          totalSales,
          conversionRate,
          avgOrderValue,
          topProducts: [],
          topBrands: [],
          salesTrend: []
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics',
        error: error.message
      });
    }
  },

  /**
   * Get or update settings
   */
  async getSettings(req, res) {
    try {
      res.json({
        success: true,
        settings: {
          commissionRate: 15,
          minPayoutAmount: 1000,
          payoutSchedule: 'monthly',
          emailNotifications: {
            orderConfirmation: true,
            brandApproval: true,
            lowStockAlerts: true
          }
        }
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching settings',
        error: error.message
      });
    }
  },

  /**
   * Update settings
   */
  async updateSettings(req, res) {
    try {
      const { commissionRate, minPayoutAmount, payoutSchedule, emailNotifications } = req.body;

      res.json({
        success: true,
        message: 'Settings updated successfully',
        settings: {
          commissionRate,
          minPayoutAmount,
          payoutSchedule,
          emailNotifications
        }
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating settings',
        error: error.message
      });
    }
  },

  /**
   * Make a user a brand
   * Admin can mark any customer as a brand
   */
  async makeUserBrand(req, res) {
    try {
      const { userId } = req.params;

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userId,
        { isBrand: true },
        { new: true }
      ).select('-password -verificationToken -verificationTokenExpiry');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${user.username} is now a brand`,
        user
      });

    } catch (error) {
      console.error('Make brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error making user a brand',
        error: error.message
      });
    }
  },

  /**
   * Revoke brand status from a user
   * Admin can mark any brand back as a regular customer
   */
  async revokeBrandStatus(req, res) {
    try {
      const { userId } = req.params;

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userId,
        { isBrand: false },
        { new: true }
      ).select('-password -verificationToken -verificationTokenExpiry');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `Brand status revoked for ${user.username}`,
        user
      });

    } catch (error) {
      console.error('Revoke brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error revoking brand status',
        error: error.message
      });
    }
  },

  /**
   * Create a new brand account
   * Admin creates a brand account with provided details
   */
  async createBrand(req, res) {
    try {
      const {
        brandName,
        ownerEmail,
        password,
        confirmPassword,
        pickupLocation,
        pincode,
        phone,
        address,
        city,
        state,
        country
      } = req.body;

      // Validation
      if (!brandName || !ownerEmail || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Brand name, email, and password are required'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      // Check if email already exists in Brand
      const existingBrand = await Brand.findOne({ ownerEmail: ownerEmail.toLowerCase() });
      if (existingBrand) {
        return res.status(409).json({
          success: false,
          message: 'Brand account with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new brand
      const newBrand = new Brand({
        brandName: brandName.trim(),
        ownerEmail: ownerEmail.toLowerCase().trim(),
        password: hashedPassword,
        pickupLocation: pickupLocation.trim(),
        pincode: pincode.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country || 'India',
        status: 'Pending',
        createdBy: req.user._id
      });

      // Save brand to database
      const savedBrand = await newBrand.save();

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Brand account created successfully',
        brand: {
          id: savedBrand._id,
          brandName: savedBrand.brandName,
          ownerEmail: savedBrand.ownerEmail,
          status: savedBrand.status,
          createdAt: savedBrand.createdAt
        }
      });

    } catch (error) {
      console.error('Create brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating brand account',
        error: error.message
      });
    }
  }
};

module.exports = adminController;
