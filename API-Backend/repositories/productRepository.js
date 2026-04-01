const Product = require('../models/Product');
const mongoose = require('mongoose');
const prisma = require('../lib/prisma');

function canUsePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function canUseMongoFallback() {
  return mongoose.connection.readyState === 1;
}

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
  if (!canUsePostgres()) {
    return null;
  }

  try {
    return await operation();
  } catch (error) {
    console.warn(
      `[productRepository] PostgreSQL ${operationName} failed, falling back to MongoDB: ${error.message}`
    );
    return null;
  }
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

module.exports = {
  getProductById,
  getProducts,
};