/**
 * Address Repository — all address CRUD through Postgres-first with Mongo fallback.
 *
 * Pattern: route → controller → repository (this file)
 * This replaces the inline raw SQL that was previously in routes/user.js.
 */

const User = require('../models/User');
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
    type: String(row.type || 'SHIPPING').toLowerCase(),
    name: row.name || '',
    phone: row.phone || '',
    addressLine1: row.addressLine1 || '',
    addressLine2: row.addressLine2 || '',
    city: row.city || '',
    state: row.state || '',
    zipCode: row.zipCode || '',
    country: row.country || 'India',
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt,
  };
}

function normalizeMongoAddress(addr) {
  const obj = typeof addr.toObject === 'function' ? addr.toObject() : { ...addr };
  return {
    _id: obj._id?.toString(),
    id: obj._id?.toString(),
    type: obj.type || 'shipping',
    name: obj.name || '',
    phone: obj.phone || '',
    addressLine1: obj.addressLine1 || '',
    addressLine2: obj.addressLine2 || '',
    city: obj.city || '',
    state: obj.state || '',
    zipCode: obj.zipCode || '',
    country: obj.country || 'India',
    isDefault: Boolean(obj.isDefault),
    createdAt: obj.createdAt,
  };
}

// ── Postgres helpers ───────────────────────────────────────────────────────────

async function pgGetAll(userId) {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM "UserAddress" WHERE "userId" = $1 ORDER BY "isDefault" DESC, "createdAt" DESC',
    [userId]
  );
  return result.rows.map(normalizeRow);
}

async function pgAdd(userId, address) {
  const pool = getPool();

  if (address.isDefault) {
    await pool.query('UPDATE "UserAddress" SET "isDefault" = FALSE WHERE "userId" = $1', [userId]);
  }

  await pool.query(
    `INSERT INTO "UserAddress" (
      id, "userId", type, name, phone, "addressLine1", "addressLine2", city, state,
      "zipCode", country, "isDefault", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
    )`,
    [
      userId,
      (address.type || 'shipping').toUpperCase(),
      address.name,
      address.phone,
      address.addressLine1,
      address.addressLine2 || null,
      address.city,
      address.state,
      address.zipCode,
      address.country || 'India',
      Boolean(address.isDefault),
    ]
  );

  return pgGetAll(userId);
}

async function pgUpdate(userId, addressId, updates) {
  const pool = getPool();

  if (updates.isDefault) {
    await pool.query('UPDATE "UserAddress" SET "isDefault" = FALSE WHERE "userId" = $1', [userId]);
  }

  const result = await pool.query(
    `UPDATE "UserAddress"
     SET type = COALESCE($3, type),
         name = COALESCE($4, name),
         phone = COALESCE($5, phone),
         "addressLine1" = COALESCE($6, "addressLine1"),
         "addressLine2" = COALESCE($7, "addressLine2"),
         city = COALESCE($8, city),
         state = COALESCE($9, state),
         "zipCode" = COALESCE($10, "zipCode"),
         country = COALESCE($11, country),
         "isDefault" = COALESCE($12, "isDefault"),
         "updatedAt" = NOW()
     WHERE id = $1 AND "userId" = $2
     RETURNING id`,
    [
      addressId,
      userId,
      updates.type ? updates.type.toUpperCase() : null,
      updates.name ?? null,
      updates.phone ?? null,
      updates.addressLine1 ?? null,
      updates.addressLine2 ?? null,
      updates.city ?? null,
      updates.state ?? null,
      updates.zipCode ?? null,
      updates.country ?? null,
      typeof updates.isDefault === 'boolean' ? updates.isDefault : null,
    ]
  );

  if (!result.rowCount) return null;
  return pgGetAll(userId);
}

async function pgDelete(userId, addressId) {
  const pool = getPool();
  const result = await pool.query(
    'DELETE FROM "UserAddress" WHERE id = $1 AND "userId" = $2 RETURNING id',
    [addressId, userId]
  );
  if (!result.rowCount) return null;
  return pgGetAll(userId);
}

async function pgSetDefault(userId, addressId) {
  const pool = getPool();
  const existing = await pool.query(
    'SELECT id FROM "UserAddress" WHERE id = $1 AND "userId" = $2 LIMIT 1',
    [addressId, userId]
  );
  if (!existing.rowCount) return null;

  await pool.query('UPDATE "UserAddress" SET "isDefault" = FALSE WHERE "userId" = $1', [userId]);
  await pool.query(
    'UPDATE "UserAddress" SET "isDefault" = TRUE, "updatedAt" = NOW() WHERE id = $1 AND "userId" = $2',
    [addressId, userId]
  );

  return pgGetAll(userId);
}

// ── Public API (Postgres-first, Mongo fallback) ────────────────────────────────

async function getAddresses(userId) {
  if (canUsePostgresForUser(userId)) {
    return pgGetAll(userId);
  }

  if (!canUseMongoFallback()) return [];

  const user = await User.findById(userId).select('addresses');
  if (!user) return [];
  return (user.addresses || []).map(normalizeMongoAddress);
}

async function addAddress(userId, address) {
  if (canUsePostgresForUser(userId)) {
    return pgAdd(userId, address);
  }

  if (!canUseMongoFallback()) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  if (address.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  user.addresses.push({
    type: address.type || 'shipping',
    name: address.name,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country || 'India',
    isDefault: address.isDefault || false,
  });

  await user.save();
  return user.addresses.map(normalizeMongoAddress);
}

async function updateAddress(userId, addressId, updates) {
  if (canUsePostgresForUser(userId)) {
    return pgUpdate(userId, addressId, updates);
  }

  if (!canUseMongoFallback()) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const idx = user.addresses.findIndex(a => a._id.toString() === addressId);
  if (idx === -1) return null;

  if (updates.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  const existing = user.addresses[idx].toObject();
  user.addresses[idx] = {
    ...existing,
    type: updates.type || existing.type,
    name: updates.name || existing.name,
    phone: updates.phone || existing.phone,
    addressLine1: updates.addressLine1 || existing.addressLine1,
    addressLine2: updates.addressLine2 !== undefined ? updates.addressLine2 : existing.addressLine2,
    city: updates.city || existing.city,
    state: updates.state || existing.state,
    zipCode: updates.zipCode || existing.zipCode,
    country: updates.country || existing.country,
    isDefault: updates.isDefault !== undefined ? updates.isDefault : existing.isDefault,
  };

  await user.save();
  return user.addresses.map(normalizeMongoAddress);
}

async function deleteAddress(userId, addressId) {
  if (canUsePostgresForUser(userId)) {
    return pgDelete(userId, addressId);
  }

  if (!canUseMongoFallback()) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const idx = user.addresses.findIndex(a => a._id.toString() === addressId);
  if (idx === -1) return null;

  user.addresses.splice(idx, 1);
  await user.save();
  return user.addresses.map(normalizeMongoAddress);
}

async function setDefaultAddress(userId, addressId) {
  if (canUsePostgresForUser(userId)) {
    return pgSetDefault(userId, addressId);
  }

  if (!canUseMongoFallback()) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const idx = user.addresses.findIndex(a => a._id.toString() === addressId);
  if (idx === -1) return null;

  user.addresses.forEach(a => (a.isDefault = false));
  user.addresses[idx].isDefault = true;
  await user.save();
  return user.addresses.map(normalizeMongoAddress);
}

module.exports = {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
};
