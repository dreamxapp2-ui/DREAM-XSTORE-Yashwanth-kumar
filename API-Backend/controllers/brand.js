/**
 * Brand Controller
 * Handles brand-specific operations (profile updates, dashboard data, etc.)
 */

const Brand = require('../models/Brand');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

const brandController = {
  /**
   * Get current brand profile
   */
  async getProfile(req, res) {
    try {
      const brand = req.brand;

      res.json({
        success: true,
        data: {
          id: brand._id,
          brandName: brand.brandName,
          ownerEmail: brand.ownerEmail,
          description: brand.description,
          status: brand.status,
          profileImage: brand.profileImage,
          socialLinks: brand.socialLinks,
          followerCount: brand.followerCount,
          pickupLocation: brand.pickupLocation,
          pincode: brand.pincode,
          phone: brand.phone,
          address: brand.address,
          city: brand.city,
          state: brand.state,
          country: brand.country,
          productCount: brand.productCount,
          createdAt: brand.createdAt,
        }
      });
    } catch (error) {
      console.error('Get brand profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching brand profile',
        error: error.message
      });
    }
  },

  /**
   * Update brand profile (description, profile image, social links, etc.)
   * Brand owner can only update their own profile
   */
  async updateProfile(req, res) {
    try {
      const { description, instagram, facebook, twitter, profileImage } = req.body;
      const brandId = req.brand._id;

      console.log('[updateProfile] Updating brand profile for:', brandId);
      console.log('[updateProfile] Body:', { description, instagram, facebook, twitter, profileImage });

      // Build update object
      const updateData = {};

      // Update description if provided
      if (description !== undefined && description !== null) {
        updateData.description = description.trim();
      }

      // Handle image from request body (Cloudinary URL sent from frontend)
      if (profileImage) {
        console.log('[updateProfile] profileImage received:', profileImage);

        let imageData = profileImage;
        // If profileImage is a JSON string, parse it
        if (typeof profileImage === 'string') {
          try {
            imageData = JSON.parse(profileImage);
            console.log('[updateProfile] Parsed profileImage:', imageData);
          } catch (e) {
            console.log('[updateProfile] Could not parse profileImage as JSON');
          }
        }

        if (imageData && imageData.url && imageData.publicId) {
          console.log('[updateProfile] Setting profileImage in updateData:', imageData);
          updateData.profileImage = imageData;
        } else {
          console.warn('[updateProfile] profileImage missing url or publicId:', imageData);
        }
      }

      // Handle image file - upload to Cloudinary
      if (req.file) {
        try {
          console.log('[updateProfile] Uploading image to Cloudinary...');
          const uploadResult = await uploadImage(req.file.buffer, 'brands', `brand-${brandId}`);
          console.log('[updateProfile] Cloudinary upload successful:', uploadResult);

          // Delete old image if it exists
          const existingBrand = await Brand.findById(brandId);
          if (existingBrand && existingBrand.profileImage && existingBrand.profileImage.publicId) {
            console.log('[updateProfile] Deleting old image:', existingBrand.profileImage.publicId);
            await deleteImage(existingBrand.profileImage.publicId).catch(err => {
              console.error('[updateProfile] Error deleting old image:', err);
            });
          }

          updateData.profileImage = {
            url: uploadResult.url,
            publicId: uploadResult.publicId
          };
        } catch (uploadError) {
          console.error('[updateProfile] Cloudinary upload failed:', uploadError);
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

      console.log('[updateProfile] Final updateData:', JSON.stringify(updateData, null, 2));

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

      console.log('[updateProfile] Brand profile updated successfully');

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
   * Create a new product for the brand
   * Brand can only create products for their own brand
   */
  async createProduct(req, res) {
    try {
      const {
        name,
        description,
        longDescription,
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

      const brandId = req.brand._id;
      const brandName = req.brand.brandName;

      console.log('[createProduct] Received data:', {
        name,
        category,
        brandId,
        brandName,
        price,
        imagesCount: images?.length,
        hasSizes,
      });

      // Validation
      if (!name || !description || !longDescription) {
        return res.status(400).json({
          success: false,
          message: 'Product name and descriptions are required',
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Product category is required',
        });
      }

      if (price <= 0 || originalPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0',
        });
      }

      if (!images || images.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one product image is required',
        });
      }

      // Import Product model
      const Product = require('../models/Product');

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
        sizeStock: hasSizes ? sizeStock : {},
        hasSizes,
        features: features || [],
        tags: tags || [],
        images,
      });

      const savedProduct = await product.save();

      console.log('[createProduct] Product created successfully:', savedProduct._id);

      // Update brand productCount
      await Brand.findByIdAndUpdate(
        brandId,
        { $inc: { productCount: 1 } },
        { new: true }
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: savedProduct._id,
          name: savedProduct.name,
          category: savedProduct.category,
          price: savedProduct.price,
          images: savedProduct.images,
          createdAt: savedProduct.createdAt
        }
      });
    } catch (error) {
      console.error('[createProduct] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  },
};

module.exports = brandController;
