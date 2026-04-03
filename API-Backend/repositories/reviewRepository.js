/**
 * Review Repository — PG-first with Mongo fallback.
 *
 * PG path: used when both userId AND productId are non-ObjectId (PG cuid/uuid).
 * Mongo path: used for legacy ObjectId users/products or when PG is unavailable.
 */

const {
  canUsePostgres,
  canUseMongoFallback,
  isMongoObjectId,
  queryPostgres,
  runPostgres,
} = require('../lib/dbHelpers');

const Review = require('../models/Review');
const Product = require('../models/Product');

const BASELINE_REVIEWS = 1500; // 1.5K baseline for startup appearance

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * True when both userId and productId are PG-compatible and PG is available.
 */
function canUsePgForReview(userId, productId) {
  return canUsePostgres() && !isMongoObjectId(userId) && !isMongoObjectId(productId);
}

function pgRowToReview(row) {
  return {
    _id: row.id,
    userId: row.user_id || row.userId,
    productId: row.product_id || row.productId,
    rating: row.rating,
    comment: row.comment || '',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    // populated user info (if joined)
    ...(row.user_username !== undefined && {
      user: {
        _id: row.user_id,
        username: row.user_username,
        email: row.user_email,
        hero_image: row.user_hero_image,
      },
    }),
  };
}

// ── Recalculate product rating ─────────────────────────────────────────────────

async function recalcProductRatingPg(productId) {
  const stats = await queryPostgres('reviewRepo.recalcRating', `
    SELECT COALESCE(AVG(rating), 0) AS avg, COUNT(*)::int AS cnt
    FROM "Review"
    WHERE "productId" = $1
  `, [productId]);

  if (!stats || stats.length === 0) return;

  const avg = Math.round(parseFloat(stats[0].avg) * 10) / 10;
  const cnt = stats[0].cnt;

  await queryPostgres('reviewRepo.updateProductRating', `
    UPDATE "Product"
    SET rating = $1, "reviewsCount" = $2, "updatedAt" = NOW()
    WHERE id = $3
  `, [avg, cnt + BASELINE_REVIEWS, productId]);
}

async function recalcProductRatingMongo(productId) {
  const allReviews = await Review.find({ productId });
  if (allReviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewsCount: BASELINE_REVIEWS,
    });
  } else {
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avg * 10) / 10,
      reviewsCount: allReviews.length + BASELINE_REVIEWS,
    });
  }
}

// ── CRUD ───────────────────────────────────────────────────────────────────────

async function createReview(userId, productId, rating, comment) {
  if (canUsePgForReview(userId, productId)) {
    const result = await runPostgres('reviewRepo.create', async () => {
      const rows = await queryPostgres('reviewRepo.create', `
        INSERT INTO "Review" (id, "userId", "productId", rating, comment, "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `, [userId, productId, rating, comment || '']);
      if (rows && rows.length > 0) {
        await recalcProductRatingPg(productId);
        return pgRowToReview(rows[0]);
      }
      return null;
    });
    if (result) return result;
  }

  // Mongo fallback
  if (!canUseMongoFallback()) throw new Error('No database available');

  const review = new Review({ userId, productId, rating, comment: comment || '' });
  await review.save();
  await recalcProductRatingMongo(productId);
  return review;
}

async function findExistingReview(userId, productId) {
  if (canUsePgForReview(userId, productId)) {
    const result = await runPostgres('reviewRepo.findExisting', async () => {
      const rows = await queryPostgres('reviewRepo.findExisting', `
        SELECT * FROM "Review" WHERE "userId" = $1 AND "productId" = $2
      `, [userId, productId]);
      return rows && rows.length > 0 ? pgRowToReview(rows[0]) : null;
    });
    if (result !== null) return result;
    // null from runPostgres means PG failed — fall through
  }

  if (!canUseMongoFallback()) return null;
  const review = await Review.findOne({ productId, userId });
  return review;
}

async function getProductReviews(productId, { page = 1, limit = 10, sortBy = 'createdAt' } = {}) {
  const skip = (page - 1) * limit;
  const orderCol = sortBy === 'rating' ? 'rating' : '"createdAt"';

  if (canUsePostgres() && !isMongoObjectId(productId)) {
    const result = await runPostgres('reviewRepo.getProductReviews', async () => {
      const countRows = await queryPostgres('reviewRepo.countForProduct', `
        SELECT COUNT(*)::int AS total FROM "Review" WHERE "productId" = $1
      `, [productId]);
      const total = countRows?.[0]?.total || 0;

      const rows = await queryPostgres('reviewRepo.listForProduct', `
        SELECT r.*, u.username AS user_username, u.email AS user_email,
               u."heroImageUrl" AS user_hero_image
        FROM "Review" r
        LEFT JOIN "User" u ON u.id = r."userId"
        WHERE r."productId" = $1
        ORDER BY r.${orderCol} DESC
        LIMIT $2 OFFSET $3
      `, [productId, limit, skip]);

      return {
        reviews: (rows || []).map(pgRowToReview),
        total,
      };
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return { reviews: [], total: 0 };

  const total = await Review.countDocuments({ productId });
  const reviews = await Review.find({ productId })
    .populate('userId', 'username email hero_image')
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return { reviews, total };
}

async function getReviewById(reviewId) {
  if (canUsePostgres() && !isMongoObjectId(reviewId)) {
    const result = await runPostgres('reviewRepo.getById', async () => {
      const rows = await queryPostgres('reviewRepo.getById', `
        SELECT r.*, u.username AS user_username, u.email AS user_email,
               u."heroImageUrl" AS user_hero_image
        FROM "Review" r
        LEFT JOIN "User" u ON u.id = r."userId"
        WHERE r.id = $1
      `, [reviewId]);
      return rows && rows.length > 0 ? pgRowToReview(rows[0]) : null;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Review.findById(reviewId)
    .populate('userId', 'username email hero_image')
    .populate('productId', 'name price images');
}

async function updateReview(reviewId, userId, { rating, comment }) {
  if (canUsePostgres() && !isMongoObjectId(reviewId)) {
    const result = await runPostgres('reviewRepo.update', async () => {
      // Fetch to verify ownership
      const existing = await queryPostgres('reviewRepo.update.fetch', `
        SELECT * FROM "Review" WHERE id = $1
      `, [reviewId]);
      if (!existing || existing.length === 0) return { found: false };
      if (existing[0].userId !== userId) return { found: true, forbidden: true };

      const sets = ['"updatedAt" = NOW()'];
      const vals = [];
      let idx = 1;

      if (rating !== undefined) {
        sets.push(`rating = $${idx++}`);
        vals.push(rating);
      }
      if (comment !== undefined) {
        sets.push(`comment = $${idx++}`);
        vals.push(comment);
      }

      vals.push(reviewId);
      const rows = await queryPostgres('reviewRepo.update.exec', `
        UPDATE "Review" SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *
      `, vals);

      if (rows && rows.length > 0) {
        await recalcProductRatingPg(rows[0].productId);
        return { found: true, review: pgRowToReview(rows[0]) };
      }

      return { found: false };
    });
    if (result) return result;
  }

  // Mongo fallback
  if (!canUseMongoFallback()) return { found: false };

  const review = await Review.findById(reviewId);
  if (!review) return { found: false };
  if (review.userId.toString() !== userId.toString()) return { found: true, forbidden: true };

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();
  await recalcProductRatingMongo(review.productId);
  return { found: true, review };
}

async function deleteReview(reviewId, userId) {
  if (canUsePostgres() && !isMongoObjectId(reviewId)) {
    const result = await runPostgres('reviewRepo.delete', async () => {
      const existing = await queryPostgres('reviewRepo.delete.fetch', `
        SELECT * FROM "Review" WHERE id = $1
      `, [reviewId]);
      if (!existing || existing.length === 0) return { found: false };
      if (existing[0].userId !== userId) return { found: true, forbidden: true };

      const productId = existing[0].productId;
      await queryPostgres('reviewRepo.delete.exec', `
        DELETE FROM "Review" WHERE id = $1
      `, [reviewId]);

      await recalcProductRatingPg(productId);
      return { found: true, deleted: true };
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return { found: false };

  const review = await Review.findById(reviewId);
  if (!review) return { found: false };
  if (review.userId.toString() !== userId.toString()) return { found: true, forbidden: true };

  const productId = review.productId;
  await Review.findByIdAndDelete(reviewId);
  await recalcProductRatingMongo(productId);
  return { found: true, deleted: true };
}

async function getUserProductReview(userId, productId) {
  return findExistingReview(userId, productId);
}

module.exports = {
  BASELINE_REVIEWS,
  createReview,
  deleteReview,
  findExistingReview,
  getProductReviews,
  getReviewById,
  getUserProductReview,
  updateReview,
};
