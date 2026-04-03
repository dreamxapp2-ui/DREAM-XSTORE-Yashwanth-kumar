/**
 * Design Repository — PG-first with Mongo fallback.
 *
 * Covers design CRUD, listing by designer, public design queries,
 * and the "latest designs" aggregate.
 */

const {
  canUsePostgres,
  canUseMongoFallback,
  isMongoObjectId,
  queryPostgres,
  runPostgres,
} = require('../lib/dbHelpers');

const Design = require('../models/Design');
const User = require('../models/User');

// ── Helpers ────────────────────────────────────────────────────────────────────

function canUsePgForDesign(designId) {
  return canUsePostgres() && !isMongoObjectId(designId);
}

function pgRowToDesign(row) {
  return {
    _id: row.id,
    title: row.title || '',
    description: row.description || '',
    designer: row.designerId || row.designer_id,
    sizes: row.sizes || [],
    brand_upload: row.brandUpload ?? row.brand_upload ?? false,
    colabs: row.collabs || row.colabs || '',
    pickup_location: row.pickupLocation || row.pickup_location || '',
    pincode: row.pincode ?? 0,
    price: parseFloat(row.price || 0),
    discount: parseFloat(row.discount || 0),
    category: row.category || '',
    images: row.images || [],
    image_1: row.image1 || row.image_1 || '',
    image_2: row.image2 || row.image_2 || '',
    image_3: row.image3 || row.image_3 || '',
    image_4: row.image4 || row.image_4 || '',
    isPublic: row.isPublic ?? row.is_public ?? true,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

// ── Lookups ────────────────────────────────────────────────────────────────────

async function getDesignById(designId) {
  if (canUsePgForDesign(designId)) {
    const result = await runPostgres('designRepo.getById', async () => {
      const rows = await queryPostgres('designRepo.getById', `
        SELECT * FROM "Design" WHERE id = $1
      `, [designId]);
      return rows && rows.length > 0 ? pgRowToDesign(rows[0]) : null;
    });
    if (result !== null) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Design.findById(designId);
}

async function getDesignsByDesigner(designerId, { sort = { createdAt: -1 } } = {}) {
  if (canUsePostgres() && !isMongoObjectId(designerId)) {
    const result = await runPostgres('designRepo.byDesigner', async () => {
      const rows = await queryPostgres('designRepo.byDesigner', `
        SELECT * FROM "Design" WHERE "designerId" = $1
        ORDER BY "createdAt" DESC
      `, [designerId]);
      return (rows || []).map(pgRowToDesign);
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return [];
  return Design.find({ designer: designerId })
    .populate('designer', 'name email')
    .sort(sort);
}

// ── Create ─────────────────────────────────────────────────────────────────────

async function createDesign(data) {
  if (canUsePostgres() && !isMongoObjectId(data.designer)) {
    const result = await runPostgres('designRepo.create', async () => {
      const rows = await queryPostgres('designRepo.create', `
        INSERT INTO "Design" (
          id, title, description, "designerId", sizes, "brandUpload",
          collabs, "pickupLocation", pincode, price, discount, category,
          images, image1, image2, image3, image4, "isPublic",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4::text[], $5,
          $6, $7, $8, $9, $10, $11,
          $12::text[], $13, $14, $15, $16, $17,
          NOW(), NOW()
        ) RETURNING *
      `, [
        data.title,
        data.description || '',
        data.designer,
        data.sizes || [],
        data.brand_upload || false,
        data.colabs || '',
        data.pickup_location || '',
        data.pincode || 0,
        data.price,
        data.discount || 0,
        data.category,
        data.images || [],
        data.image_1 || '',
        data.image_2 || '',
        data.image_3 || '',
        data.image_4 || '',
        data.isPublic !== undefined ? data.isPublic : true,
      ]);
      return rows && rows.length > 0 ? pgRowToDesign(rows[0]) : null;
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) throw new Error('No database available');

  const design = new Design(data);
  await design.save();
  return design;
}

// ── Update ─────────────────────────────────────────────────────────────────────

async function updateDesign(designId, updateFields) {
  if (canUsePgForDesign(designId)) {
    const result = await runPostgres('designRepo.update', async () => {
      const sets = ['"updatedAt" = NOW()'];
      const vals = [];
      let idx = 1;

      const fieldMap = {
        title: 'title',
        description: 'description',
        price: 'price',
        discount: 'discount',
        category: 'category',
        isPublic: '"isPublic"',
        sizes: 'sizes',
        image_1: 'image1',
        image_2: 'image2',
        image_3: 'image3',
        image_4: 'image4',
        images: 'images',
      };

      for (const [key, val] of Object.entries(updateFields)) {
        const pgCol = fieldMap[key];
        if (pgCol) {
          if (key === 'sizes' || key === 'images') {
            sets.push(`${pgCol} = $${idx}::text[]`);
          } else {
            sets.push(`${pgCol} = $${idx}`);
          }
          vals.push(val);
          idx++;
        }
      }

      vals.push(designId);
      const rows = await queryPostgres('designRepo.update.exec', `
        UPDATE "Design" SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *
      `, vals);
      return rows && rows.length > 0 ? pgRowToDesign(rows[0]) : null;
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return null;
  return Design.findByIdAndUpdate(designId, { $set: updateFields }, { new: true });
}

// ── Delete ─────────────────────────────────────────────────────────────────────

async function deleteDesign(designId) {
  if (canUsePgForDesign(designId)) {
    const result = await runPostgres('designRepo.delete', async () => {
      const rows = await queryPostgres('designRepo.delete', `
        DELETE FROM "Design" WHERE id = $1 RETURNING id
      `, [designId]);
      return rows && rows.length > 0;
    });
    if (result) return true;
  }

  if (!canUseMongoFallback()) return false;
  const deleted = await Design.findByIdAndDelete(designId);
  return !!deleted;
}

// ── Public / branded listing ───────────────────────────────────────────────────

async function getPublicDesignsByBrandUsers(limit = 25) {
  if (canUsePostgres()) {
    const result = await runPostgres('designRepo.publicByBrands', async () => {
      // Join with User where isBrand = true
      const rows = await queryPostgres('designRepo.publicByBrands', `
        SELECT d.* FROM "Design" d
        INNER JOIN "User" u ON u.id = d."designerId" AND u."isBrand" = true
        WHERE d."isPublic" = true
        ORDER BY d."createdAt" DESC
        LIMIT $1
      `, [limit]);
      return (rows || []).map(pgRowToDesign);
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return [];

  const brandedUsers = await User.find({ isBrand: true }).select('_id');
  const brandedUserIds = brandedUsers.map((u) => u._id);

  return Design.find({ isPublic: true, designer: { $in: brandedUserIds } })
    .select('_id title category images price description')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getPublicBrandedDesigns(limit = 25) {
  if (canUsePostgres()) {
    const result = await runPostgres('designRepo.publicBranded', async () => {
      const rows = await queryPostgres('designRepo.publicBranded', `
        SELECT * FROM "Design"
        WHERE "isPublic" = true AND "brandUpload" = true
        ORDER BY "createdAt" DESC
        LIMIT $1
      `, [limit]);
      return (rows || []).map(pgRowToDesign);
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return [];

  return Design.find({ isPublic: true, brand_upload: true })
    .select('_id title category images price discount designer pincode pickup_location sizes')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getLatestDesignsGrouped() {
  if (canUsePostgres()) {
    const result = await runPostgres('designRepo.latestGrouped', async () => {
      const rows = await queryPostgres('designRepo.latestGrouped', `
        SELECT DISTINCT ON (d."designerId")
          d.id, d.images, d."designerId",
          u.username AS user_name
        FROM "Design" d
        LEFT JOIN "User" u ON u.id = d."designerId"
        ORDER BY d."designerId", d."createdAt" DESC
      `, []);
      return (rows || []).map((row) => ({
        image_1: row.images?.[0] || null,
        username: row.user_name || null,
      }));
    });
    if (result) return result;
  }

  if (!canUseMongoFallback()) return [];

  return Design.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$designer', design: { $first: '$$ROOT' } } },
    { $lookup: { from: 'users', localField: 'design.designer', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { _id: 0, image_1: { $arrayElemAt: ['$design.images', 0] }, username: '$user.name' } },
  ]);
}

module.exports = {
  createDesign,
  deleteDesign,
  getDesignById,
  getDesignsByDesigner,
  getLatestDesignsGrouped,
  getPublicBrandedDesigns,
  getPublicDesignsByBrandUsers,
  updateDesign,
};
