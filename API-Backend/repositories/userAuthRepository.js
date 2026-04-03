const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const {
  canUseMongoFallback,
  canUsePostgres,
  getPool,
  queryPostgres: sharedQueryPostgres,
  runPostgres,
} = require('../lib/dbHelpers');

const ROLE_TO_LEGACY = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

const AUTH_TYPE_TO_LEGACY = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
};

function normalizeUser(record) {
  if (!record) {
    return null;
  }

  if (typeof record.toObject === 'function') {
    const user = record.toObject();
    return {
      ...user,
      id: user._id?.toString() || user.id,
      _id: user._id?.toString() || user.id,
    };
  }

  return {
    id: record.id,
    _id: record.id,
    email: record.email,
    password: record.passwordHash,
    username: record.username,
    firstName: record.firstName,
    lastName: record.lastName,
    googleId: record.googleId,
    profilePicture: record.profilePictureUrl,
    authType: AUTH_TYPE_TO_LEGACY[record.authType] || 'email',
    isVerified: record.isVerified,
    verificationToken: record.verificationToken,
    verificationTokenExpiry: record.verificationTokenExpiry,
    bio: record.bio,
    isBrand: record.isBrand,
    hero_image: {
      url: record.heroImageUrl,
      publicId: record.heroImagePublicId,
    },
    pickup_location: record.pickupLocation,
    pincode: record.pincode || 0,
    bank_ac: record.bankAccount,
    ifsc: record.ifsc,
    phone: record.phone,
    address: record.address,
    city: record.city,
    state: record.state,
    country: record.country,
    role: ROLE_TO_LEGACY[record.role] || 'user',
    status: (record.status || 'ACTIVE').toLowerCase(),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function queryPostgres(queryText, values = []) {
  return sharedQueryPostgres('userAuthRepo', queryText, values);
}

async function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const postgresRows = await queryPostgres(
    'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
    [normalizedEmail]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.findOne({ email: normalizedEmail });
  return normalizeUser(mongoUser);
}

async function getUserByGoogleId(googleId) {
  const postgresRows = await queryPostgres(
    'SELECT * FROM "User" WHERE "googleId" = $1 LIMIT 1',
    [googleId]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.findOne({ googleId });
  return normalizeUser(mongoUser);
}

async function getUserById(userId) {
  const postgresRows = await queryPostgres(
    'SELECT * FROM "User" WHERE id = $1 LIMIT 1',
    [userId]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.findById(userId);
  return normalizeUser(mongoUser);
}

async function createUser(payload) {
  const postgresRows = await queryPostgres(
    `INSERT INTO "User" (
      id, email, "passwordHash", username, "authType", "verificationToken",
      "verificationTokenExpiry", "isVerified", "isBrand", role, status,
      bio, "pickupLocation", "bankAccount", ifsc, phone, address, city, state, country,
      "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, 'EMAIL', $5,
      $6, $7, $8, 'USER', 'ACTIVE',
      '', '', '', '', '', '', '', '', '',
      NOW(), NOW()
    ) RETURNING *`,
    [
      crypto.randomUUID(),
      payload.email.trim().toLowerCase(),
      payload.password,
      payload.username,
      payload.verificationToken,
      payload.verificationTokenExpiry,
      payload.isVerified,
      payload.isBrand,
    ]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.create(payload);
  return normalizeUser(mongoUser);
}

async function deleteUserById(userId) {
  const postgresRows = await queryPostgres(
    'DELETE FROM "User" WHERE id = $1 RETURNING id',
    [userId]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return true;
  }

  if (!canUseMongoFallback()) {
    return false;
  }

  const result = await User.deleteOne({ _id: userId });
  return result.deletedCount > 0;
}

async function verifyUserEmail(token) {
  const now = new Date();

  const postgresRows = await queryPostgres(
    `UPDATE "User"
     SET "isVerified" = TRUE,
         "verificationToken" = NULL,
         "verificationTokenExpiry" = NULL,
         "updatedAt" = NOW()
     WHERE "verificationToken" = $1 AND "verificationTokenExpiry" > $2
     RETURNING *`,
    [token, now]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: now },
  });

  if (!mongoUser) {
    return null;
  }

  mongoUser.isVerified = true;
  mongoUser.verificationToken = undefined;
  mongoUser.verificationTokenExpiry = undefined;
  await mongoUser.save();

  return normalizeUser(mongoUser);
}

async function updatePassword(userId, passwordHash) {
  const postgresRows = await queryPostgres(
    `UPDATE "User"
     SET "passwordHash" = $2,
         "updatedAt" = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, passwordHash]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.findById(userId);
  if (!mongoUser) {
    return null;
  }

  mongoUser.password = passwordHash;
  await mongoUser.save();
  return normalizeUser(mongoUser);
}

async function linkGoogleAccount(userId, googleProfile) {
  const postgresRows = await queryPostgres(
    `UPDATE "User"
     SET "googleId" = $2,
         "isVerified" = TRUE,
         "authType" = 'GOOGLE',
         "firstName" = COALESCE($3, "firstName"),
         "lastName" = COALESCE($4, "lastName"),
         "profilePictureUrl" = COALESCE($5, "profilePictureUrl"),
         "updatedAt" = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, googleProfile.id, googleProfile.firstName, googleProfile.lastName, googleProfile.profilePicture]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.findById(userId);
  if (!mongoUser) {
    return null;
  }

  mongoUser.googleId = googleProfile.id;
  mongoUser.isVerified = true;
  mongoUser.authType = 'google';
  if (googleProfile.firstName) mongoUser.firstName = googleProfile.firstName;
  if (googleProfile.lastName) mongoUser.lastName = googleProfile.lastName;
  if (googleProfile.profilePicture) mongoUser.profilePicture = googleProfile.profilePicture;
  await mongoUser.save();

  return normalizeUser(mongoUser);
}

async function createGoogleUser(googleProfile) {
  const postgresRows = await queryPostgres(
    `INSERT INTO "User" (
      id, email, "googleId", "firstName", "lastName", "profilePictureUrl",
      "authType", "isVerified", "isBrand", role, status,
      bio, "pickupLocation", "bankAccount", ifsc, phone, address, city, state, country,
      "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      'GOOGLE', TRUE, FALSE, 'USER', 'ACTIVE',
      '', '', '', '', '', '', '', '', '',
      NOW(), NOW()
    ) RETURNING *`,
    [
      crypto.randomUUID(),
      googleProfile.email.trim().toLowerCase(),
      googleProfile.id,
      googleProfile.firstName || null,
      googleProfile.lastName || null,
      googleProfile.profilePicture || null,
    ]
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoUser = await User.create({
    googleId: googleProfile.id,
    email: googleProfile.email,
    firstName: googleProfile.firstName,
    lastName: googleProfile.lastName,
    profilePicture: googleProfile.profilePicture,
    authType: 'google',
    isVerified: true,
  });

  return normalizeUser(mongoUser);
}

async function updateUserProfile(userId, updates) {
  // Build SET clause dynamically so we only touch supplied fields
  const fieldMap = {
    firstName: '"firstName"',
    lastName: '"lastName"',
    username: '"username"',
    bio: '"bio"',
    phone: '"phone"',
    email: '"email"',
    heroImageUrl: '"heroImageUrl"',
    heroImagePublicId: '"heroImagePublicId"',
    pickupLocation: '"pickupLocation"',
  };

  const setClauses = [];
  const values = [userId]; // $1 = userId
  let idx = 2;

  for (const [jsKey, pgCol] of Object.entries(fieldMap)) {
    if (updates[jsKey] !== undefined) {
      setClauses.push(`${pgCol} = $${idx}`);
      values.push(updates[jsKey]);
      idx++;
    }
  }

  if (setClauses.length === 0) {
    // Nothing to update — just return current user
    return getUserById(userId);
  }

  setClauses.push('"updatedAt" = NOW()');

  const postgresRows = await queryPostgres(
    `UPDATE "User" SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  const postgresUser = postgresRows?.[0] || null;

  if (postgresUser) {
    return normalizeUser(postgresUser);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  // Mongo fallback — map field names to Mongoose schema names
  const mongoUpdates = {};
  if (updates.firstName !== undefined) mongoUpdates.firstName = updates.firstName;
  if (updates.lastName !== undefined) mongoUpdates.lastName = updates.lastName;
  if (updates.username !== undefined) mongoUpdates.username = updates.username;
  if (updates.bio !== undefined) mongoUpdates.bio = updates.bio;
  if (updates.phone !== undefined) mongoUpdates.phone = updates.phone;
  if (updates.email !== undefined) mongoUpdates.email = updates.email;
  if (updates.heroImageUrl !== undefined || updates.heroImagePublicId !== undefined) {
    mongoUpdates.hero_image = {
      url: updates.heroImageUrl || null,
      publicId: updates.heroImagePublicId || null,
    };
  }
  if (updates.pickupLocation !== undefined) mongoUpdates.pickup_location = updates.pickupLocation;

  const mongoUser = await User.findByIdAndUpdate(userId, { $set: mongoUpdates }, { new: true });
  return normalizeUser(mongoUser);
}

function getAuthStorageStatus() {
  return {
    postgres: canUsePostgres(),
    mongoFallback: canUseMongoFallback(),
  };
}

// ── Admin methods ──────────────────────────────────────────────────────────────

const ROLE_FROM_LEGACY = { user: 'USER', admin: 'ADMIN', superadmin: 'SUPERADMIN' };

async function listUsers({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
  const offset = (page - 1) * limit;

  // Build PG WHERE
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filter.role) {
    const pgRole = ROLE_FROM_LEGACY[filter.role] || filter.role.toUpperCase();
    conditions.push(`role = $${idx++}`);
    values.push(pgRole);
  }
  if (filter.status) {
    conditions.push(`status = $${idx++}`);
    values.push(filter.status.toUpperCase());
  }
  if (filter.isBrand !== undefined) {
    conditions.push(`"isBrand" = $${idx++}`);
    values.push(filter.isBrand);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countValues = [...values];
  values.push(limit, offset);

  const [users, countResult] = await Promise.all([
    queryPostgres(
      `SELECT * FROM "User" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${idx++} OFFSET $${idx++}`,
      values
    ),
    queryPostgres(
      `SELECT COUNT(*)::int AS count FROM "User" ${whereClause}`,
      countValues
    ),
  ]);

  if (users) {
    const total = countResult?.[0]?.count || 0;
    return { users: users.map(normalizeUser), total };
  }

  if (!canUseMongoFallback()) {
    return { users: [], total: 0 };
  }

  const mongoFilter = {};
  if (filter.role) mongoFilter.role = filter.role;
  if (filter.status) mongoFilter.status = filter.status;
  if (filter.isBrand !== undefined) mongoFilter.isBrand = filter.isBrand;

  const [mongoUsers, total] = await Promise.all([
    User.find(mongoFilter)
      .select('-password -verificationToken -verificationTokenExpiry')
      .limit(limit)
      .skip(offset)
      .sort(sort),
    User.countDocuments(mongoFilter),
  ]);

  return { users: mongoUsers.map(normalizeUser), total };
}

async function countUsers(filter = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filter.role) {
    if (filter.role.$in) {
      const pgRoles = filter.role.$in.map(r => (ROLE_FROM_LEGACY[r] || r.toUpperCase()));
      conditions.push(`role = ANY($${idx++})`);
      values.push(pgRoles);
    } else {
      const pgRole = ROLE_FROM_LEGACY[filter.role] || filter.role.toUpperCase();
      conditions.push(`role = $${idx++}`);
      values.push(pgRole);
    }
  }
  if (filter.isBrand !== undefined) {
    conditions.push(`"isBrand" = $${idx++}`);
    values.push(filter.isBrand);
  }
  if (filter.isVerified !== undefined) {
    conditions.push(`"isVerified" = $${idx++}`);
    values.push(filter.isVerified);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await queryPostgres(
    `SELECT COUNT(*)::int AS count FROM "User" ${whereClause}`,
    values
  );

  if (result) {
    return result[0]?.count || 0;
  }

  if (!canUseMongoFallback()) {
    return 0;
  }

  return User.countDocuments(filter);
}

async function updateUserRole(userId, role) {
  const pgRole = ROLE_FROM_LEGACY[role] || role.toUpperCase();

  const rows = await queryPostgres(
    `UPDATE "User" SET role = $2, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [userId, pgRole]
  );

  if (rows?.[0]) {
    return normalizeUser(rows[0]);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true })
    .select('-password -verificationToken -verificationTokenExpiry');
  return normalizeUser(user);
}

async function updateUserStatus(userId, status) {
  const pgStatus = status.toUpperCase();

  const rows = await queryPostgres(
    `UPDATE "User" SET status = $2, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [userId, pgStatus]
  );

  if (rows?.[0]) {
    return normalizeUser(rows[0]);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
  return normalizeUser(user);
}

async function setBrandFlag(userId, isBrand) {
  const rows = await queryPostgres(
    `UPDATE "User" SET "isBrand" = $2, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [userId, isBrand]
  );

  if (rows?.[0]) {
    return normalizeUser(rows[0]);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const user = await User.findByIdAndUpdate(userId, { isBrand }, { new: true })
    .select('-password -verificationToken -verificationTokenExpiry');
  return normalizeUser(user);
}

async function addCollab(userId, collabId) {
  const rows = await queryPostgres(
    `UPDATE "User" SET collab = array_append(
       CASE WHEN NOT ($2 = ANY(COALESCE(collab, '{}'))) THEN COALESCE(collab, '{}') ELSE collab END,
       CASE WHEN NOT ($2 = ANY(COALESCE(collab, '{}'))) THEN $2 ELSE NULL END
     ), "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [userId, collabId]
  );

  if (rows?.[0]) {
    return normalizeUser(rows[0]);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { collab: collabId } },
    { new: true }
  ).select('username collab');
  return normalizeUser(user);
}

async function getBrandUsers({ filter = {}, limit, fields } = {}) {
  const conditions = ['"isBrand" = TRUE'];
  const values = [];
  let idx = 1;

  if (filter._id && filter._id.$ne) {
    conditions.push(`id != $${idx++}`);
    values.push(filter._id.$ne.toString());
  }
  if (filter._id && filter._id.$in) {
    conditions.push(`id = ANY($${idx++})`);
    values.push(filter._id.$in.map(id => id.toString()));
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const limitClause = limit ? `LIMIT ${parseInt(limit, 10)}` : '';

  const rows = await queryPostgres(
    `SELECT * FROM "User" ${whereClause} ORDER BY "createdAt" DESC ${limitClause}`,
    values
  );

  if (rows) {
    return rows.map(normalizeUser);
  }

  if (!canUseMongoFallback()) {
    return [];
  }

  const mongoFilter = { isBrand: true, ...filter };
  let query = User.find(mongoFilter);
  if (fields) query = query.select(fields);
  if (limit) query = query.limit(limit);
  const users = await query;
  return users.map(normalizeUser);
}

async function getUsersByIds(ids) {
  if (!ids || ids.length === 0) return [];

  const rows = await queryPostgres(
    `SELECT * FROM "User" WHERE id = ANY($1)`,
    [ids.map(id => id.toString())]
  );

  if (rows) {
    return rows.map(normalizeUser);
  }

  if (!canUseMongoFallback()) {
    return [];
  }

  const users = await User.find({ _id: { $in: ids } });
  return users.map(normalizeUser);
}

async function setPasswordDirect(userId, rawPassword) {
  // For OTP flow — saves the raw OTP as "password" (legacy behavior)
  const rows = await queryPostgres(
    `UPDATE "User" SET "passwordHash" = $2, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [userId, rawPassword]
  );

  if (rows?.[0]) {
    return normalizeUser(rows[0]);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const user = await User.findById(userId);
  if (!user) return null;
  user.password = rawPassword;
  await user.save();
  return normalizeUser(user);
}

module.exports = {
  addCollab,
  countUsers,
  createUser,
  createGoogleUser,
  deleteUserById,
  getAuthStorageStatus,
  getBrandUsers,
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  getUsersByIds,
  linkGoogleAccount,
  listUsers,
  setBrandFlag,
  setPasswordDirect,
  updatePassword,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
  verifyUserEmail,
};