/**
 * Order Repository — Postgres Order/OrderItem tables first, Mongo fallback.
 *
 * Pattern: route → controller → repository (this file)
 * Replaces the direct Mongoose Order calls that were in routes/user.js.
 */

const Order = require('../models/Order');
const mongoose = require('mongoose');
const {
  canUseMongoFallback,
  canUsePostgresForUser,
  getPool,
  isMongoObjectId,
  queryPostgres,
} = require('../lib/dbHelpers');

// ── Normalizers ────────────────────────────────────────────────────────────────

function toNumber(v) {
  if (v == null) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'object' && typeof v.toNumber === 'function') return v.toNumber();
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
}

function normalizeOrder(row) {
  return {
    _id: row.id,
    id: row.id,
    userId: row.userId,
    brandId: row.brandId,
    subtotal: toNumber(row.subtotal),
    tax: toNumber(row.tax),
    shippingFee: toNumber(row.shippingFee),
    total: toNumber(row.total),
    paymentStatus: (row.paymentStatus || 'PENDING').toLowerCase(),
    paymentMethod: (row.paymentMethod || 'card').toLowerCase(),
    shippingStatus: (row.shippingStatus || 'PENDING').toLowerCase(),
    orderStatus: (row.orderStatus || 'PENDING').toLowerCase(),
    addressSnapshot: row.addressSnapshot,
    items: row.items || [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizeMongoOrder(doc) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id?.toString(),
    _id: obj._id?.toString(),
  };
}

// ── Postgres helpers ───────────────────────────────────────────────────────────

async function pgCreateOrder(userId, payload) {
  const pool = getPool();

  // Insert order
  const orderResult = await pool.query(
    `INSERT INTO "Order" (
      id, "userId", "brandId", "userAddressId", subtotal, tax, "shippingFee", total,
      "paymentStatus", "paymentMethod", "shippingStatus", "orderStatus",
      "addressSnapshot", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7,
      $8, $9, 'PENDING', 'PENDING',
      $10, NOW(), NOW()
    ) RETURNING *`,
    [
      userId,
      payload.brandId || null,
      payload.userAddressId || null,
      payload.subtotal || payload.total,
      payload.tax || 0,
      payload.shippingFee || 0,
      payload.total,
      (payload.paymentStatus || 'PENDING').toUpperCase(),
      (payload.paymentMethod || 'CARD').toUpperCase(),
      payload.shippingAddressSnapshot ? JSON.stringify(payload.shippingAddressSnapshot) : null,
    ]
  );

  const order = orderResult.rows[0];

  // Insert order items
  if (payload.items?.length) {
    for (const item of payload.items) {
      await pool.query(
        `INSERT INTO "OrderItem" (
          id, "orderId", "productId", title, category, size, "unitPrice", quantity, image, "createdAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW()
        )`,
        [
          order.id,
          item.productId || item._id || null,
          item.title || item.name || '',
          item.category || null,
          item.size ? item.size.toUpperCase() : null,
          item.price || 0,
          item.quantity || 1,
          item.image || null,
        ]
      );
    }
  }

  return normalizeOrder({ ...order, items: payload.items || [] });
}

async function pgGetOrders(userId, { page = 1, limit = 10, status } = {}) {
  const pool = getPool();
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE o."userId" = $1';
  const values = [userId];

  if (status) {
    whereClause += ` AND o."orderStatus" = $${values.length + 1}`;
    values.push(status.toUpperCase());
  }

  // Count
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM "Order" o ${whereClause}`,
    values
  );
  const total = countResult.rows[0]?.total || 0;

  // Orders with items
  const ordersResult = await pool.query(
    `SELECT o.* FROM "Order" o ${whereClause} ORDER BY o."createdAt" DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  const orders = [];
  for (const row of ordersResult.rows) {
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.images AS product_images, p.price AS product_price
       FROM "OrderItem" oi
       LEFT JOIN "Product" p ON p.id = oi."productId"
       WHERE oi."orderId" = $1
       ORDER BY oi."createdAt"`,
      [row.id]
    );
    orders.push(normalizeOrder({ ...row, items: itemsResult.rows }));
  }

  return { data: orders, total, page, limit, pages: Math.ceil(total / limit) };
}

async function pgGetOrderStats(userId) {
  const pool = getPool();

  const statsResult = await pool.query(
    `SELECT
       COUNT(*)::int AS "totalOrders",
       COALESCE(SUM(CASE WHEN "paymentStatus" = 'COMPLETED' THEN total ELSE 0 END), 0)::float AS "totalSpend"
     FROM "Order"
     WHERE "userId" = $1`,
    [userId]
  );

  const stats = statsResult.rows[0] || { totalOrders: 0, totalSpend: 0 };

  const breakdownResult = await pool.query(
    `SELECT "orderStatus" AS status, COUNT(*)::int AS count
     FROM "Order" WHERE "userId" = $1
     GROUP BY "orderStatus"`,
    [userId]
  );

  const statusBreakdown = {};
  for (const row of breakdownResult.rows) {
    statusBreakdown[row.status.toLowerCase()] = row.count;
  }

  // Recent 5
  const recentResult = await pool.query(
    `SELECT o.* FROM "Order" o WHERE o."userId" = $1 ORDER BY o."createdAt" DESC LIMIT 5`,
    [userId]
  );

  const recentOrders = [];
  for (const row of recentResult.rows) {
    const items = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.images AS product_images
       FROM "OrderItem" oi LEFT JOIN "Product" p ON p.id = oi."productId"
       WHERE oi."orderId" = $1`, [row.id]
    );
    recentOrders.push(normalizeOrder({ ...row, items: items.rows }));
  }

  return {
    totalOrders: stats.totalOrders,
    totalSpend: stats.totalSpend,
    statusBreakdown,
    recentOrders,
  };
}

async function pgGetOrderById(userId, orderId) {
  const pool = getPool();

  const orderResult = await pool.query(
    'SELECT * FROM "Order" WHERE id = $1 AND "userId" = $2 LIMIT 1',
    [orderId, userId]
  );

  if (!orderResult.rowCount) return null;

  const order = orderResult.rows[0];
  const items = await pool.query(
    `SELECT oi.*, p.name AS product_name, p.images AS product_images,
            p.price AS product_price, p."brandName" AS "product_brandName"
     FROM "OrderItem" oi LEFT JOIN "Product" p ON p.id = oi."productId"
     WHERE oi."orderId" = $1`,
    [order.id]
  );

  return normalizeOrder({ ...order, items: items.rows });
}

// ── Public API ─────────────────────────────────────────────────────────────────

async function createOrder(userId, payload) {
  if (canUsePostgresForUser(userId)) {
    return pgCreateOrder(userId, payload);
  }

  if (!canUseMongoFallback()) return null;

  const newOrder = new Order({
    _id: new mongoose.Types.ObjectId(),
    userId,
    items: (payload.items || []).map(item => ({
      productId: item.productId || item._id,
      title: item.title || item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    subtotal: payload.subtotal || payload.total,
    tax: payload.tax || 0,
    shippingFee: payload.shippingFee || 0,
    total: payload.total,
    paymentStatus: payload.paymentStatus || 'pending',
    paymentMethod: payload.paymentMethod || 'card',
    shippingAddressSnapshot: payload.shippingAddressSnapshot || payload.shippingData,
    orderStatus: 'processing',
    createdAt: new Date(),
  });

  await newOrder.save();
  return normalizeMongoOrder(newOrder);
}

async function getOrders(userId, options = {}) {
  if (canUsePostgresForUser(userId)) {
    return pgGetOrders(userId, options);
  }

  if (!canUseMongoFallback()) {
    return { data: [], total: 0, page: options.page || 1, limit: options.limit || 10, pages: 0 };
  }

  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;
  const filter = { userId };
  if (status) filter.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId', 'name images price')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    data: orders.map(normalizeMongoOrder),
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
  };
}

async function getOrderStats(userId) {
  if (canUsePostgresForUser(userId)) {
    return pgGetOrderStats(userId);
  }

  if (!canUseMongoFallback()) {
    return { totalOrders: 0, totalSpend: 0, statusBreakdown: {}, recentOrders: [] };
  }

  const totalOrders = await Order.countDocuments({ userId });
  const completedOrders = await Order.find({ userId, paymentStatus: 'completed' }).select('total');
  const totalSpend = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

  const statusBreakdown = {};
  const agg = await Order.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);
  for (const item of agg) {
    statusBreakdown[item._id] = item.count;
  }

  const recentOrders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('items.productId', 'name images')
    .lean();

  return {
    totalOrders,
    totalSpend,
    statusBreakdown,
    recentOrders: recentOrders.map(normalizeMongoOrder),
  };
}

async function getLatestOrders(userId, limit = 10) {
  if (canUsePostgresForUser(userId)) {
    const result = await pgGetOrders(userId, { page: 1, limit });
    return result.data;
  }

  if (!canUseMongoFallback()) return [];

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return orders.map(normalizeMongoOrder);
}

async function getOrderById(userId, orderId) {
  if (canUsePostgresForUser(userId)) {
    return pgGetOrderById(userId, orderId);
  }

  if (!canUseMongoFallback()) return null;

  const order = await Order.findOne({ _id: orderId, userId })
    .populate('items.productId', 'name images price brandName')
    .populate('shippingId')
    .lean();

  return order ? normalizeMongoOrder(order) : null;
}

module.exports = {
  createOrder,
  getLatestOrders,
  getOrderById,
  getOrders,
  getOrderStats,
};
