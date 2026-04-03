const reviewRepo = require('../repositories/reviewRepository');
const { getProductById } = require('../repositories/productRepository');

/**
 * Create a new review for a product
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await reviewRepo.findExistingReview(userId, productId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await reviewRepo.createReview(userId, productId, rating, comment);
    console.log('[createReview] Review created:', review._id);

    res.status(201).json({ success: true, message: 'Review created successfully', data: review });
  } catch (error) {
    console.error('[createReview] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create review', error: error.message });
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

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { reviews, total } = await reviewRepo.getProductReviews(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
    });

    const displayTotal = total + reviewRepo.BASELINE_REVIEWS;

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total: displayTotal,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(displayTotal / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[getProductReviews] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

/**
 * Get a specific review
 * GET /api/reviews/:reviewId
 */
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewRepo.getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('[getReview] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch review', error: error.message });
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

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const result = await reviewRepo.updateReview(reviewId, userId, { rating, comment });

    if (!result.found) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (result.forbidden) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
    }

    console.log('[updateReview] Review updated:', reviewId);
    res.json({ success: true, message: 'Review updated successfully', data: result.review });
  } catch (error) {
    console.error('[updateReview] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review', error: error.message });
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

    const result = await reviewRepo.deleteReview(reviewId, userId);

    if (!result.found) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (result.forbidden) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    console.log('[deleteReview] Review deleted:', reviewId);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('[deleteReview] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
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

    const review = await reviewRepo.getUserProductReview(userId, productId);

    if (!review) {
      return res.json({ success: true, data: null, message: 'No review found for this product' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('[getUserProductReview] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch review', error: error.message });
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
