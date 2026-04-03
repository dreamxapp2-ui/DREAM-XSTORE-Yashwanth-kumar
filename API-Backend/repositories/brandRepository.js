/**
 * Brand Repository — PG-first with Mongo fallback.
 *
 * Covers all Brand CRUD: login lookup, profile get/update, create, delete,
 * status management, listing, and Google OAuth flows.
 */

const {
  canUsePostgres,
  canUseMongoFallback,
  isMongoObjectId,
  queryPostgres,
  runPostgres,
} = require('../lib/dbHelpers');

const Brand = require('../models/Brand');

// ── Helpers ────────────────────────────────────────────────────────────────────

function canUsePgForBrand(brandId) {
  return canUsePostgres() && !isMongoObjectId(brandId);
}

/** Map a PG row to the shape controllers/middleware expect (mirrors Mongoose doc). */
function pgRowToBrand(row) {
  return {
    _id: row.id,
    brandName: row.brandName || row.brand_name,
    ownerEmail: row.ownerEmail || row.owner_email,
    passwordHash: row.passwordHash || row.password_hash,
    // Expose as `password` too so bcrypt.compare(input, brand.password) works
    password: row.passwordHash || row.password_hash,
    profileImage: {
      url: row.profileImageUrl || row.profile_image_url || null,
      publicId: row.profileImageId || row.profile_image_id || null,
    },
    followerCount: row.followerCount ?? row.follower_count ?? 0,
    description: row.description || '',
    socialLinks: {
      instagram: row.instagram || null,
      facebook: row.facebook || null,
      twitter: row.twitter || null,
    },
    pickupLocation: row.pickupLocation || row.pickup_location || '',
    pincode: row.pincode || '',
    phone: row.phone || '',
    address: row.address || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || 'India',
    status: (row.status || 'PENDING').charAt(0) + (row.status || 'PENDING').slice(1).toLowerCase(),
    isVerified: row.isVerified ?? row.is_verified ?? false,
    productCount: row.productCount ?? row.product_count ?? 0,
    commissionRate: parseFloat(row.commissionRate ?? row.commission_rate ?? 20),
    googleId: row.googleId || row.google_id || undefined,
    createdById: row.createdById || row.created_by_id || undefined,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

// ── Lookups ────────────────────────────────────────────────────────────────────

async function getBrandById(brandId) {
  if (canUsePgForBrand(brandId)) {
    const result = await runPostgres('brandRepo.getById', async () => {
      const rows = await queryPostgres('brandRepo.getById', `
        SELECT * FROM "Brand" WHERE id = $1
      `, [brandId]);
      return rows && rows.length > 0 ? pgRowToBrand(rows[0]) : null;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Brand.findById(brandId);
}

async function getBrandByIdSafe(brandId) {
  const brand = await getBrandById(brandId);
  if (brand && brand.password) {
    const safe = { ...brand };
    delete safe.password;
    delete safe.passwordHash;
    return safe;
  }
  if (brand && typeof brand.toObject === 'function') {
    const obj = brand.toObject();
    delete obj.password;
    return obj;
  }
  return brand;
}

async function getBrandByNameAndEmail(brandName, ownerEmail) {
  if (canUsePostgres()) {
    const result = await runPostgres('brandRepo.getByNameEmail', async () => {
      const rows = await queryPostgres('brandRepo.getByNameEmail', `
        SELECT * FROM "Brand" WHERE "brandName" = $1 AND "ownerEmail" = $2
      `, [brandName, ownerEmail.toLowerCase()]);
      return rows && rows.length > 0 ? pgRowToBrand(rows[0]) : null;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Brand.findOne({ brandName, ownerEmail });
}

async function getBrandByEmail(ownerEmail) {
  if (canUsePostgres()) {
    const result = await runPostgres('brandRepo.getByEmail', async () => {
      const rows = await queryPostgres('brandRepo.getByEmail', `
        SELECT * FROM "Brand" WHERE "ownerEmail" = $1
      `, [ownerEmail.toLowerCase()]);
      return rows && rows.length > 0 ? pgRowToBrand(rows[0]) : null;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Brand.findOne({ ownerEmail });
}

async function getBrandByGoogleId(googleId) {
  if (canUsePostgres()) {
    const result = await runPostgres('brandRepo.getByGoogleId', async () => {
      const rows = await queryPostgres('brandRepo.getByGoogleId', `
        SELECT * FROM "Brand" WHERE "googleId" = $1
      `, [googleId]);
      return rows && rows.length > 0 ? pgRowToBrand(rows[0]) : null;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Brand.findOne({ googleId });
}

// ── CRUD ───────────────────────────────────────────────────────────────────────

async function createBrand(data) {
  if (canUsePostgres()) {
    const result = await runPostgres('brandRepo.create', async () => {
      const rows = await queryPostgres('brandRepo.create', `
        INSERT INTO "Brand" (
          id, "brandName", "ownerEmail", "passwordHash",
          "pickupLocation", pincode, phone, address, city, state, country,
          status, "isVerified", "googleId", "createdById",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3,
          $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          NOW(), NOW()
        ) RETURNING *
      `, [
        data.brandName,
        data.ownerEmail.toLowerCase(),
        data.passwordHash || data.password,
        data.pickupLocation || '',
        data.pincode || '',
        data.phone || '',
        data.address || '',
        data.city || '',
        data.state || '',
        data.country || 'India',
        (data.status || 'Pending').toUpperCase(),
        data.isVerified || false,
        data.googleId || null,
        data.createdById || null,
      ]);
      return rows && rows.length > 0 ? pgRowToBrand(rows[0]) : null;
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) throw new Error('No database available');
  const brand = await Brand.create(data);
  return brand;
}

async function updateBrand(brandId, updateData) {
  if (canUsePgForBrand(brandId)) {
    const result = await runPostgres('brandRepo.update', async () => {
      const sets = ['"updatedAt" = NOW()'];
      const vals = [];
      let idx = 1;

      const fieldMap = {
        description: 'description',
        brandName: '"brandName"',
        status: 'status',
        isVerified: '"isVerified"',
        productCount: '"productCount"',
        commissionRate: '"commissionRate"',
        'profileImage.url': '"profileImageUrl"',
        'profileImage.publicId': '"profileImageId"',
        profileImageUrl: '"profileImageUrl"',
        profileImageId: '"profileImageId"',
        instagram: 'instagram',
        facebook: 'facebook',
        twitter: 'twitter',
        googleId: '"googleId"',
        passwordHash: '"passwordHash"',
        phone: 'phone',
        address: 'address',
        city: 'city',
        state: 'state',
        pickupLocation: '"pickupLocation"',
        pincode: 'pincode',
      };

      // Handle nested profileImage object
      if (updateData.profileImage && typeof updateData.profileImage === 'object') {
        if (updateData.profileImage.url !== undefined) {
          sets.push(`"profileImageUrl" = $${idx}`);
          vals.push(updateData.profileImage.url);
          idx++;
        }
        if (updateData.profileImage.publicId !== undefined) {
          sets.push(`"profileImageId" = $${idx}`);
          vals.push(updateData.profileImage.publicId);
          idx++;
        }
        delete updateData.profileImage;
      }

      // Handle nested socialLinks object
      if (updateData.socialLinks && typeof updateData.socialLinks === 'object') {
        for (const [key, val] of Object.entries(updateData.socialLinks)) {
          if (['instagram', 'facebook', 'twitter'].includes(key)) {
            sets.push(`${key} = $${idx}`);
            vals.push(val);
            idx++;
          }
        }
        delete updateData.socialLinks;
      }

      // Handle status enum conversion
      if (updateData.status) {
        sets.push(`status = $${idx}`);
        vals.push(updateData.status.toUpperCase());
        idx++;
        delete updateData.status;
      }

      // Handle $inc for productCount
      if (updateData.$inc) {
        for (const [key, amount] of Object.entries(updateData.$inc)) {
          const pgCol = fieldMap[key];
          if (pgCol) {
            sets.push(`${pgCol} = ${pgCol} + $${idx}`);
            vals.push(amount);
            idx++;
          }
        }
        delete updateData.$inc;
      }

      for (const [key, val] of Object.entries(updateData)) {
        const pgCol = fieldMap[key];
        if (pgCol) {
          sets.push(`${pgCol} = $${idx}`);
          vals.push(val);
          idx++;
        }
      }

      vals.push(brandId);
      const rows = await queryPostgres('brandRepo.update.exec', `
        UPDATE "Brand" SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *
      `, vals);

      return rows && rows.length > 0 ? pgRowToBrand(rows[0]) : null;
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return null;

  // Mongo path: flatten nested updates for $set
  const mongoSet = {};
  for (const [key, val] of Object.entries(updateData)) {
    if (key === '$inc') continue;
    if (key === 'socialLinks' && typeof val === 'object') {
      for (const [sk, sv] of Object.entries(val)) {
        mongoSet[`socialLinks.${sk}`] = sv;
      }
    } else {
      mongoSet[key] = val;
    }
  }

  const mongoOps = { $set: mongoSet };
  if (updateData.$inc) mongoOps.$inc = updateData.$inc;

  return Brand.findByIdAndUpdate(brandId, mongoOps, { new: true, runValidators: true }).select('-password');
}

async function deleteBrand(brandId) {
  if (canUsePgForBrand(brandId)) {
    const result = await runPostgres('brandRepo.delete', async () => {
      const rows = await queryPostgres('brandRepo.delete', `
        DELETE FROM "Brand" WHERE id = $1 RETURNING id
      `, [brandId]);
      return rows && rows.length > 0;
    });
    if (result) return true;
  }

  if (!canUseMongoFallback()) return false;
  const deleted = await Brand.findByIdAndDelete(brandId);
  return !!deleted;
}

// ── Listing / counting ─────────────────────────────────────────────────────────

async function listBrands({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, select } = {}) {
  if (canUsePostgres()) {
    const result = await runPostgres('brandRepo.list', async () => {
      const whereClauses = ['1=1'];
      const vals = [];
      let idx = 1;

      if (filter.status) {
        whereClauses.push(`status = $${idx}`);
        vals.push(filter.status.toUpperCase());
        idx++;
      }
      if (filter.brandName && filter.brandName.$regex) {
        whereClauses.push(`"brandName" ILIKE $${idx}`);
        vals.push(`%${filter.brandName.$regex}%`);
        idx++;
      }
      if (filter.ownerEmail && filter.ownerEmail.$regex) {
        whereClauses.push(`"ownerEmail" ILIKE $${idx}`);
        vals.push(`%${filter.ownerEmail.$regex}%`);
        idx++;
      }

      const where = whereClauses.join(' AND ');
      const offset = (page - 1) * limit;

      // Sort
      let orderBy = '"createdAt" DESC';
      if (sort) {
        const sortKey = Object.keys(sort)[0];
        const dir = sort[sortKey] === -1 ? 'DESC' : 'ASC';
        const colMap = { createdAt: '"createdAt"', brandName: '"brandName"', status: 'status' };
        orderBy = `${colMap[sortKey] || '"createdAt"'} ${dir}`;
      }

      const countRows = await queryPostgres('brandRepo.list.count', `
        SELECT COUNT(*)::int AS total FROM "Brand" WHERE ${where}
      `, vals);

      const dataRows = await queryPostgres('brandRepo.list.data', `
        SELECT * FROM "Brand" WHERE ${where}
        ORDER BY ${orderBy}
        LIMIT $${idx} OFFSET $${idx + 1}
      `, [...vals, limit, offset]);

      return {
        brands: (dataRows || []).map(pgRowToBrand),
        total: countRows?.[0]?.total || 0,
      };
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return { brands: [], total: 0 };

  const total = await Brand.countDocuments(filter);
  const selectStr = select || '-password';
  const brands = await Brand.find(filter)
    .select(selectStr)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sort);

  return { brands, total };
}

async function countBrands(filter = {}) {
  if (canUsePostgres()) {
    const result = await runPostgres('brandRepo.count', async () => {
      const whereClauses = ['1=1'];
      const vals = [];
      let idx = 1;

      if (filter.status) {
        whereClauses.push(`status = $${idx}`);
        vals.push(filter.status.toUpperCase());
        idx++;
      }

      const rows = await queryPostgres('brandRepo.count', `
        SELECT COUNT(*)::int AS total FROM "Brand" WHERE ${whereClauses.join(' AND ')}
      `, vals);
      return rows?.[0]?.total || 0;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return 0;
  return Brand.countDocuments(filter);
}

// ── Google OAuth helpers ───────────────────────────────────────────────────────

async function linkGoogleAccount(brandId, googleId) {
  return updateBrand(brandId, { googleId, isVerified: true });
}

async function createGoogleBrand(profile) {
  return createBrand({
    googleId: profile.id,
    ownerEmail: profile.email,
    brandName: profile.displayName || profile.firstName || 'Google Brand',
    password: Math.random().toString(36).slice(-8) + 'A1!',
    isVerified: true,
    pickupLocation: '',
    pincode: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });
}

module.exports = {
  countBrands,
  createBrand,
  createGoogleBrand,
  deleteBrand,
  getBrandByEmail,
  getBrandByGoogleId,
  getBrandById,
  getBrandByIdSafe,
  getBrandByNameAndEmail,
  linkGoogleAccount,
  listBrands,
  updateBrand,
};
