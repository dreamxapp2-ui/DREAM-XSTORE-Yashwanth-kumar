const User = require('../models/User');
const mongoose = require('mongoose');

function isMongoObjectId(value) {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

/**
 * Add product to user's wishlist
 * POST /api/user/wishlist/add
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!isMongoObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Wishlist is not available for this account yet'
      });
    }

    console.log('[addToWishlist] Request received - productId:', productId, 'userId:', userId);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Convert to ObjectId if it's a string
    const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
      ? new mongoose.Types.ObjectId(productId) 
      : productId;

    // Check if already in wishlist
    const user = await User.findById(userId);
    console.log('[addToWishlist] Current wishlist:', user.wishlist);
    
    const alreadyInWishlist = user.wishlist?.some(
      (item) => item.productId.toString() === productObjectId.toString()
    );

    console.log('[addToWishlist] Already in wishlist:', alreadyInWishlist);

    if (alreadyInWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          wishlist: {
            productId: productObjectId,
            addedAt: new Date()
          }
        }
      },
      { new: true, select: 'email username firstName lastName bio hero_image phone wishlist isBrand' }
    );

    console.log('[addToWishlist] Product added successfully:', productObjectId);
    console.log('[addToWishlist] Updated user wishlist:', updatedUser.wishlist);

    res.json({
      success: true,
      message: 'Product added to wishlist',
      user: updatedUser
    });
  } catch (error) {
    console.error('[addToWishlist] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
};

/**
 * Remove product from user's wishlist
 * POST /api/user/wishlist/remove
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!isMongoObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Wishlist is not available for this account yet'
      });
    }

    console.log('[removeFromWishlist] Request received - productId:', productId, 'userId:', userId);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Convert to ObjectId if it's a string
    const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
      ? new mongoose.Types.ObjectId(productId) 
      : productId;

    // Remove from wishlist
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          wishlist: {
            productId: productObjectId
          }
        }
      },
      { new: true, select: 'email username firstName lastName bio hero_image phone wishlist isBrand' }
    );

    console.log('[removeFromWishlist] Product removed successfully:', productObjectId);
    console.log('[removeFromWishlist] Updated user wishlist:', updatedUser.wishlist);

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      user: updatedUser
    });
  } catch (error) {
    console.error('[removeFromWishlist] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
};

/**
 * Get user's wishlist
 * GET /api/user/wishlist
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    if (!isMongoObjectId(userId)) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0,
        }
      });
    }

    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .select('wishlist')
      .populate({
        path: 'wishlist.productId',
        select: 'name price originalPrice discount images rating reviewsCount brandName'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const wishlistItems = user.wishlist || [];
    const paginatedItems = wishlistItems.slice(skip, skip + parseInt(limit));
    const total = wishlistItems.length;

    console.log('[getWishlist] Wishlist items:', wishlistItems.length);

    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[getWishlist] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
};
