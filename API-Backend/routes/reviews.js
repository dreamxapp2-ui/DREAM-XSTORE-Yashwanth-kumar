const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  getUserProductReview
} = require('../controllers/reviewController');

/**
 * POST /api/reviews
 * Create a new review
 * Requires: Authentication
 * Body: { productId, rating (1-5), comment (optional) }
 */
router.post('/reviews', auth, createReview);

/**
 * GET /api/reviews/product/:productId
 * Get all reviews for a product
 * Query: page, limit, sortBy
 */
router.get('/reviews/product/:productId', getProductReviews);

/**
 * GET /api/reviews/user/:productId
 * Get user's review for a specific product
 * Requires: Authentication
 */
router.get('/reviews/user/:productId', auth, getUserProductReview);

/**
 * GET /api/reviews/:reviewId
 * Get a specific review
 */
router.get('/reviews/:reviewId', getReview);

/**
 * PUT /api/reviews/:reviewId
 * Update a review
 * Requires: Authentication (user must be review author)
 * Body: { rating (optional), comment (optional) }
 */
router.put('/reviews/:reviewId', auth, updateReview);

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review
 * Requires: Authentication (user must be review author)
 */
router.delete('/reviews/:reviewId', auth, deleteReview);

module.exports = router;
