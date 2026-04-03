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

module.exports = {
  createUser,
  createGoogleUser,
  deleteUserById,
  getAuthStorageStatus,
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  linkGoogleAccount,
  updatePassword,
  updateUserProfile,
  verifyUserEmail,
};