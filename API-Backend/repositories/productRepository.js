const Product = require('../models/Product');
const prisma = require('../lib/prisma');
const {
  canUseMongoFallback,
  canUsePostgres,
  runPostgres: sharedRunPostgres,
} = require('../lib/dbHelpers');

function toNumber(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : numericValue;
}

function buildSizeStock(product) {
  if (product.sizeStock) {
    return product.sizeStock;
  }

  return {
    XS: product.stockXs ?? 0,
    S: product.stockS ?? 0,
    M: product.stockM ?? 0,
    L: product.stockL ?? 0,
    XL: product.stockXl ?? 0,
    XXL: product.stockXxl ?? 0,
    XXXL: product.stockXxxl ?? 0,
  };
}

function normalizeProduct(record) {
  if (!record) {
    return null;
  }

  const product = typeof record.toObject === 'function' ? record.toObject() : { ...record };
  const productId = product.id || product._id?.toString();
  const normalizedBrandId =
    typeof product.brandId === 'object' && product.brandId !== null
      ? product.brandId.id || product.brandId._id?.toString()
      : product.brandId;
  const normalizedBrandName = product.brandName || product.brand?.brandName || product.brandId?.brandName;
  const originalPrice = toNumber(product.originalPrice);
  const discount = toNumber(product.discount) ?? 0;

  return {
    ...product,
    id: productId,
    _id: product._id || productId,
    brand: product.brand
      ? {
          id: product.brand.id || product.brand._id?.toString(),
          name: product.brand.brandName,
          brandName: product.brand.brandName,
        }
      : undefined,
    brandId: normalizedBrandId,
    brandName: normalizedBrandName,
    price: toNumber(product.price),
    originalPrice,
    discount,
    rating: toNumber(product.rating),
    weight: toNumber(product.weight),
    length: toNumber(product.length),
    breadth: toNumber(product.breadth),
    height: toNumber(product.height),
    sizeStock: buildSizeStock(product),
    finalPrice:
      originalPrice !== null && originalPrice !== undefined
        ? Math.round(originalPrice * (1 - discount / 100))
        : undefined,
  };
}

function buildMongoFilter(filters) {
  const filter = {};

  if (filters.category) {
    filter.category = filters.category;
  }

  if (filters.featured) {
    filter.isFeatured = true;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.price = {};
    if (filters.minPrice !== undefined) filter.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) filter.price.$lte = filters.maxPrice;
  }

  if (filters.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { brandName: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } },
    ];
  }

  return filter;
}

function buildPrismaWhere(filters) {
  const where = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.featured) {
    where.isFeatured = true;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { brandName: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search } },
    ];
  }

  return where;
}

function resolveSortBy(sortBy) {
  const sortableFields = new Set([
    'createdAt',
    'updatedAt',
    'price',
    'originalPrice',
    'discount',
    'rating',
    'reviewsCount',
    'name',
  ]);

  return sortableFields.has(sortBy) ? sortBy : 'createdAt';
}

async function runPostgres(operationName, operation) {
  return sharedRunPostgres(`productRepo.${operationName}`, operation);
}

async function getProducts(filters) {
  const sortBy = resolveSortBy(filters.sortBy);
  const page = Number.parseInt(filters.page, 10) || 1;
  const limit = Number.parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const postgresResult = await runPostgres('read products', async () => {
    const where = buildPrismaWhere(filters);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              brandName: true,
            },
          },
        },
        orderBy: { [sortBy]: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  });

  if (postgresResult && postgresResult.products.length > 0) {
    return {
      products: postgresResult.products.map(normalizeProduct),
      total: postgresResult.total,
      page,
      limit,
    };
  }

  if (!canUseMongoFallback()) {
    return {
      products: postgresResult ? postgresResult.products.map(normalizeProduct) : [],
      total: postgresResult ? postgresResult.total : 0,
      page,
      limit,
    };
  }

  const mongoFilter = buildMongoFilter(filters);
  const [products, total] = await Promise.all([
    Product.find(mongoFilter)
      .populate('brandId', 'brandName')
      .limit(limit)
      .skip(skip)
      .sort({ [sortBy]: -1 })
      .lean(),
    Product.countDocuments(mongoFilter),
  ]);

  return {
    products: products.map(normalizeProduct),
    total,
    page,
    limit,
  };
}

async function getProductById(productId) {
  const postgresProduct = await runPostgres('read product by id', () =>
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
          },
        },
      },
    })
  );

  if (postgresProduct) {
    return normalizeProduct(postgresProduct);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoProduct = await Product.findById(productId).populate('brandId', 'brandName').lean();
  return normalizeProduct(mongoProduct);
}

// ── Size helpers ───────────────────────────────────────────────────────────────

const SIZE_COL_MAP = {
  XS: 'stockXs',
  S: 'stockS',
  M: 'stockM',
  L: 'stockL',
  XL: 'stockXl',
  XXL: 'stockXxl',
  XXXL: 'stockXxxl',
};

function sizeStockToCols(sizeStock) {
  const cols = {};
  if (!sizeStock) return cols;
  for (const [size, col] of Object.entries(SIZE_COL_MAP)) {
    if (sizeStock[size] !== undefined) {
      cols[col] = parseInt(sizeStock[size], 10) || 0;
    }
  }
  return cols;
}

// ── Create ─────────────────────────────────────────────────────────────────────

async function createProduct(data) {
  const sizeCols = sizeStockToCols(data.sizeStock);

  const postgresProduct = await runPostgres('create product', () =>
    prisma.product.create({
      data: {
        brandId: data.brandId,
        brandName: data.brandName,
        name: data.name,
        description: data.description || '',
        longDescription: data.longDescription || '',
        category: data.category,
        subCategory: data.subCategory || null,
        price: data.price,
        originalPrice: data.originalPrice,
        discount: data.discount || 0,
        stockQuantity: data.stockQuantity || 0,
        hasSizes: data.hasSizes ?? true,
        sizes: data.hasSizes ? (data.sizes || []) : [],
        images: data.images || [],
        features: data.features || [],
        tags: data.tags || [],
        inStock: (data.stockQuantity || 0) > 0,
        ...sizeCols,
      },
      include: { brand: { select: { id: true, brandName: true } } },
    })
  );

  if (postgresProduct) {
    return normalizeProduct(postgresProduct);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoProduct = await Product.create(data);
  return normalizeProduct(mongoProduct);
}

// ── Update ─────────────────────────────────────────────────────────────────────

async function updateProduct(productId, data) {
  const updateData = { ...data };

  // Convert sizeStock map to individual PG columns
  if (updateData.sizeStock) {
    const sizeCols = sizeStockToCols(updateData.sizeStock);
    Object.assign(updateData, sizeCols);
    delete updateData.sizeStock;
  }

  // Strip fields Prisma doesn't accept
  delete updateData._id;
  delete updateData.id;
  delete updateData.brand;

  const postgresProduct = await runPostgres('update product', () =>
    prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { brand: { select: { id: true, brandName: true } } },
    })
  );

  if (postgresProduct) {
    return normalizeProduct(postgresProduct);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoProduct = await Product.findByIdAndUpdate(productId, data, {
    new: true,
    runValidators: true,
  }).populate('brandId', 'brandName').lean();

  return normalizeProduct(mongoProduct);
}

// ── Delete ─────────────────────────────────────────────────────────────────────

async function deleteProduct(productId) {
  const postgresProduct = await runPostgres('delete product', () =>
    prisma.product.delete({
      where: { id: productId },
    })
  );

  if (postgresProduct) {
    return normalizeProduct(postgresProduct);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoProduct = await Product.findByIdAndDelete(productId);
  return normalizeProduct(mongoProduct);
}

// ── Toggle Status ──────────────────────────────────────────────────────────────

async function toggleProductStatus(productId) {
  // First get current status
  const product = await getProductById(productId);
  if (!product) return null;

  const newStatus = !product.isActive;

  const postgresProduct = await runPostgres('toggle product status', () =>
    prisma.product.update({
      where: { id: productId },
      data: { isActive: newStatus },
      include: { brand: { select: { id: true, brandName: true } } },
    })
  );

  if (postgresProduct) {
    return normalizeProduct(postgresProduct);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoProduct = await Product.findById(productId);
  if (!mongoProduct) return null;
  mongoProduct.isActive = newStatus;
  await mongoProduct.save();
  return normalizeProduct(mongoProduct);
}

// ── Stock Management ───────────────────────────────────────────────────────────

async function updateStock(productId, sizeStock, stockQuantity) {
  const sizeCols = sizeStockToCols(sizeStock);

  const postgresProduct = await runPostgres('update stock', () =>
    prisma.product.update({
      where: { id: productId },
      data: {
        ...sizeCols,
        stockQuantity,
        inStock: stockQuantity > 0,
      },
    })
  );

  if (postgresProduct) {
    return normalizeProduct(postgresProduct);
  }

  if (!canUseMongoFallback()) {
    return null;
  }

  const mongoProduct = await Product.findById(productId);
  if (!mongoProduct) return null;
  if (sizeStock) mongoProduct.sizeStock = sizeStock;
  mongoProduct.stockQuantity = stockQuantity;
  await mongoProduct.save();
  return normalizeProduct(mongoProduct);
}

// ── Count ──────────────────────────────────────────────────────────────────────

async function countProducts(filter = {}) {
  const postgresCount = await runPostgres('count products', () => {
    const where = buildPrismaWhere(filter);
    return prisma.product.count({ where });
  });

  if (postgresCount !== null && postgresCount !== undefined) {
    return postgresCount;
  }

  if (!canUseMongoFallback()) {
    return 0;
  }

  return Product.countDocuments(buildMongoFilter(filter));
}

module.exports = {
  countProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  toggleProductStatus,
  updateProduct,
  updateStock,
};