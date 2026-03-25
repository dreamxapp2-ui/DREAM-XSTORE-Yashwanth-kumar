const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * Create a new review for a product
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create new review
    const review = new Review({
      userId,
      productId,
      rating,
      comment: comment || ''
    });

    await review.save();

    // Update product rating and reviewsCount
    const allReviews = await Review.find({ productId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    const BASELINE_REVIEWS = 1500; // 1.5K baseline for startup appearance
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewsCount: allReviews.length + BASELINE_REVIEWS // Add baseline to actual reviews
    });

    console.log('[createReview] Review created:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('[createReview] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

/**
 * Get all reviews for a product
 * GET /api/reviews/product/:productId
 */
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find({ productId })
      .populate('userId', 'username email hero_image')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get all reviews for this product
    const total = await Review.countDocuments({ productId });
    const BASELINE_REVIEWS = 1500; // 1.5K baseline for startup appearance
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        total: total + BASELINE_REVIEWS, // Add baseline to actual count
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((total + BASELINE_REVIEWS) / limit)
      }
    });
  } catch (error) {
    console.error('[getProductReviews] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Get a specific review
 * GET /api/reviews/:reviewId
 */
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('userId', 'username email hero_image')
      .populate('productId', 'name price images');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('[getReview] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
};

/**
 * Update a review
 * PUT /api/reviews/:reviewId
 */
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Recalculate product rating
    const allReviews = await Review.find({ productId: review.productId });
    const BASELINE_REVIEWS = 1500; // 1.5K baseline for startup appearance
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(review.productId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewsCount: allReviews.length + BASELINE_REVIEWS // Add baseline to actual reviews
    });

    console.log('[updateReview] Review updated:', reviewId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('[updateReview] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:reviewId
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    const allReviews = await Review.find({ productId });
    const BASELINE_REVIEWS = 1500; // 1.5K baseline for startup appearance
    
    if (allReviews.length === 0) {
      // No reviews left, reset to baseline only
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewsCount: BASELINE_REVIEWS
      });
    } else {
      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewsCount: allReviews.length + BASELINE_REVIEWS // Add baseline to actual reviews
      });
    }

    console.log('[deleteReview] Review deleted:', reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('[deleteReview] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Get user's review for a product
 * GET /api/reviews/user/:productId
 */
const getUserProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({ productId, userId })
      .populate('userId', 'username email hero_image');

    // Return null data instead of 404 when user hasn't reviewed yet
    if (!review) {
      return res.json({
        success: true,
        data: null,
        message: 'No review found for this product'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('[getUserProductReview] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  getUserProductReview
};
