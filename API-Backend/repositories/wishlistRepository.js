/**
 * Wishlist Repository — Postgres WishlistItem table first, Mongo embedded fallback.
 *
 * Pattern: route → controller → repository (this file)
 * Replaces the embedded User.wishlist[] Mongo approach with the proper
 * WishlistItem table defined in the Prisma schema.
 */

const User = require('../models/User');
const mongoose = require('mongoose');
const {
  canUseMongoFallback,
  canUsePostgresForUser,
  getPool,
  isMongoObjectId,
  queryPostgres,
} = require('../lib/dbHelpers');

// ── Normalizers ────────────────────────────────────────────────────────────────

function normalizeRow(row) {
  return {
    _id: row.id,
    id: row.id,
    productId: row.product_name
      ? {
          id: row.productId,
          _id: row.productId,
          name: row.product_name,
          price: parseFloat(row.product_price),
          originalPrice: parseFloat(row.product_originalPrice || 0),
          discount: parseFloat(row.product_discount || 0),
          images: row.product_images || [],
          rating: parseFloat(row.product_rating || 0),
          reviewsCount: row.product_reviewsCount || 0,
          brandName: row.product_brandName || '',
        }
      : row.productId,
    addedAt: row.addedAt,
  };
}

// ── Postgres helpers ───────────────────────────────────────────────────────────

async function pgAdd(userId, productId) {
  const pool = getPool();

  // Check duplicate
  const existing = await pool.query(
    'SELECT id FROM "WishlistItem" WHERE "userId" = $1 AND "productId" = $2 LIMIT 1',
    [userId, productId]
  );

  if (existing.rowCount > 0) {
    return { alreadyExists: true };
  }

  await pool.query(
    `INSERT INTO "WishlistItem" (id, "userId", "productId", "addedAt")
     VALUES (gen_random_uuid()::text, $1, $2, NOW())`,
    [userId, productId]
  );

  return { alreadyExists: false };
}

async function pgRemove(userId, productId) {
  const pool = getPool();
  const result = await pool.query(
    'DELETE FROM "WishlistItem" WHERE "userId" = $1 AND "productId" = $2 RETURNING id',
    [userId, productId]
  );
  return result.rowCount > 0;
}

async function pgGet(userId, page, limit) {
  const pool = getPool();
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    'SELECT COUNT(*)::int AS total FROM "WishlistItem" WHERE "userId" = $1',
    [userId]
  );
  const total = countResult.rows[0]?.total || 0;

  const rows = await pool.query(
    `SELECT
       w.id, w."productId", w."addedAt",
       p.name      AS product_name,
       p.price      AS product_price,
       p."originalPrice" AS "product_originalPrice",
       p.discount   AS product_discount,
       p.images     AS product_images,
       p.rating     AS product_rating,
       p."reviewsCount" AS "product_reviewsCount",
       p."brandName" AS "product_brandName"
     FROM "WishlistItem" w
     LEFT JOIN "Product" p ON p.id = w."productId"
     WHERE w."userId" = $1
     ORDER BY w."addedAt" DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    items: rows.rows.map(normalizeRow),
    total,
  };
}

async function pgCount(userId) {
  const pool = getPool();
  const result = await pool.query(
    'SELECT COUNT(*)::int AS total FROM "WishlistItem" WHERE "userId" = $1',
    [userId]
  );
  return result.rows[0]?.total || 0;
}

// ── Public API ─────────────────────────────────────────────────────────────────

async function addToWishlist(userId, productId) {
  if (canUsePostgresForUser(userId)) {
    return pgAdd(userId, productId);
  }

  if (!canUseMongoFallback()) {
    return { alreadyExists: false, unavailable: true };
  }

  const productObjectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const user = await User.findById(userId);
  if (!user) return { unavailable: true };

  const already = user.wishlist?.some(
    item => item.productId.toString() === productObjectId.toString()
  );
  if (already) return { alreadyExists: true };

  await User.findByIdAndUpdate(userId, {
    $push: { wishlist: { productId: productObjectId, addedAt: new Date() } },
  });

  return { alreadyExists: false };
}

async function removeFromWishlist(userId, productId) {
  if (canUsePostgresForUser(userId)) {
    return pgRemove(userId, productId);
  }

  if (!canUseMongoFallback()) return false;

  const productObjectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  await User.findByIdAndUpdate(userId, {
    $pull: { wishlist: { productId: productObjectId } },
  });

  return true;
}

async function getWishlist(userId, page = 1, limit = 10) {
  if (canUsePostgresForUser(userId)) {
    return pgGet(userId, page, limit);
  }

  if (!canUseMongoFallback()) {
    return { items: [], total: 0 };
  }

  const user = await User.findById(userId)
    .select('wishlist')
    .populate({
      path: 'wishlist.productId',
      select: 'name price originalPrice discount images rating reviewsCount brandName',
    });

  if (!user) return { items: [], total: 0 };

  const all = user.wishlist || [];
  const total = all.length;
  const skip = (page - 1) * limit;
  const paginated = all.slice(skip, skip + limit);

  return { items: paginated, total };
}

async function getWishlistCount(userId) {
  if (canUsePostgresForUser(userId)) {
    return pgCount(userId);
  }

  if (!canUseMongoFallback()) return 0;

  const user = await User.findById(userId).select('wishlist');
  return user?.wishlist?.length || 0;
}

module.exports = {
  addToWishlist,
  getWishlist,
  getWishlistCount,
  removeFromWishlist,
};
