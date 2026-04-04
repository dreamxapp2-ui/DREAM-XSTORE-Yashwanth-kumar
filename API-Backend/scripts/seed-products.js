/**
 * Seed script: Creates a brand and sample products in the database.
 *
 * Usage:
 *   node scripts/seed-products.js
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env
 *   - At least one user with role 'admin' or 'superadmin' in the DB
 *     (the script will find one automatically)
 */

require('dotenv').config();
const prisma = require('../lib/prisma');

const SAMPLE_PRODUCTS = [
  {
    name: 'Classic White T-Shirt',
    description: 'Premium cotton crew-neck tee with a relaxed fit.',
    longDescription: 'Made from 100% organic cotton, this classic white t-shirt offers all-day comfort with a modern relaxed fit. Perfect for layering or wearing on its own.',
    category: 'T-Shirts',
    price: 799,
    originalPrice: 1299,
    discount: 38,
    stockQuantity: 100,
    hasSizes: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
    features: ['100% Organic Cotton', 'Relaxed Fit', 'Pre-shrunk'],
    tags: ['cotton', 'basics', 'white', 'casual'],
    sizeStock: { XS: 10, S: 20, M: 30, L: 20, XL: 15, XXL: 5, XXXL: 0 },
  },
  {
    name: 'Sporty Hoodie',
    description: 'Warm fleece-lined hoodie for workouts and casual wear.',
    longDescription: 'Stay warm during workouts or weekend outings with this fleece-lined hoodie. Features a kangaroo pocket, adjustable drawstring hood, and ribbed cuffs.',
    category: 'Hoodies',
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    stockQuantity: 75,
    hasSizes: true,
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600'],
    features: ['Fleece-lined', 'Kangaroo Pocket', 'Adjustable Hood'],
    tags: ['hoodie', 'sportswear', 'warm', 'fleece'],
    sizeStock: { XS: 5, S: 15, M: 25, L: 20, XL: 10, XXL: 0, XXXL: 0 },
  },
  {
    name: 'Slim Fit Denim Jeans',
    description: 'Modern slim-fit jeans with stretch comfort.',
    longDescription: 'These slim-fit jeans combine classic denim styling with modern stretch fabric for all-day comfort. Available in a versatile dark indigo wash.',
    category: 'Jeans',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    stockQuantity: 60,
    hasSizes: true,
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    features: ['Stretch Denim', 'Slim Fit', '5-Pocket Design'],
    tags: ['jeans', 'denim', 'slim-fit', 'casual'],
    sizeStock: { XS: 0, S: 10, M: 20, L: 20, XL: 10, XXL: 0, XXXL: 0 },
  },
  {
    name: 'Casual Sneakers',
    description: 'Lightweight everyday sneakers with cushioned sole.',
    longDescription: 'Step out in style with these lightweight casual sneakers. Featuring a breathable mesh upper and cushioned EVA sole for all-day comfort.',
    category: 'Footwear',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    stockQuantity: 50,
    hasSizes: true,
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'],
    features: ['Breathable Mesh', 'Cushioned Sole', 'Lightweight'],
    tags: ['sneakers', 'footwear', 'casual', 'comfortable'],
    sizeStock: { XS: 0, S: 10, M: 15, L: 15, XL: 10, XXL: 0, XXXL: 0 },
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Compact faux-leather crossbody for everyday essentials.',
    longDescription: 'This sleek crossbody bag features premium faux-leather construction with an adjustable strap, multiple compartments, and a secure zip closure.',
    category: 'Accessories',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    stockQuantity: 40,
    hasSizes: false,
    sizes: [],
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
    features: ['Faux Leather', 'Adjustable Strap', 'Multiple Compartments'],
    tags: ['bag', 'crossbody', 'accessories', 'leather'],
    sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0 },
  },
  {
    name: 'Summer Floral Dress',
    description: 'Light and breezy floral print midi dress.',
    longDescription: 'Embrace summer with this flowing midi dress featuring a vibrant floral print, V-neckline, and flattering A-line silhouette. Perfect for brunches and garden parties.',
    category: 'Dresses',
    price: 1799,
    originalPrice: 2499,
    discount: 28,
    stockQuantity: 45,
    hasSizes: true,
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'],
    features: ['Floral Print', 'Midi Length', 'V-Neckline'],
    tags: ['dress', 'floral', 'summer', 'women'],
    sizeStock: { XS: 5, S: 10, M: 15, L: 10, XL: 5, XXL: 0, XXXL: 0 },
  },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  // 1. Find an admin/superadmin user to use as the brand creator
  let adminUser = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
  });

  if (!adminUser) {
    console.log('No admin user found. Creating a superadmin user...');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Admin@123', 10);
    adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dreamxstore.com',
        passwordHash: hash,
        role: 'SUPERADMIN',
      },
    });
    console.log(`  Created superadmin: ${adminUser.email} (password: Admin@123)`);
  } else {
    console.log(`  Using existing admin: ${adminUser.email} (role: ${adminUser.role})`);
  }

  // 2. Check for an existing brand or create one
  let brand = await prisma.brand.findFirst();

  if (!brand) {
    console.log('\nCreating sample brand...');
    const bcrypt = require('bcryptjs');
    const brandHash = await bcrypt.hash('Brand@123', 10);
    brand = await prisma.brand.create({
      data: {
        brandName: 'DreamX Fashion',
        ownerEmail: 'brand@dreamxstore.com',
        passwordHash: brandHash,
        description: 'Trendy fashion for the modern generation.',
        pickupLocation: 'Warehouse A',
        pincode: '500001',
        phone: '9876543210',
        address: '123 Fashion Street',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        status: 'ACTIVE',
        isVerified: true,
        createdById: adminUser.id,
      },
    });
    console.log(`  Created brand: ${brand.brandName} (id: ${brand.id})`);
  } else {
    console.log(`\n  Using existing brand: ${brand.brandName} (id: ${brand.id})`);
  }

  // 3. Create products
  console.log('\nCreating products...');
  let created = 0;

  for (const product of SAMPLE_PRODUCTS) {
    // Check if product already exists by name + brand
    const existing = await prisma.product.findFirst({
      where: { name: product.name, brandId: brand.id },
    });

    if (existing) {
      console.log(`  ⏭  "${product.name}" already exists, skipping.`);
      continue;
    }

    const sizeStock = product.sizeStock || {};
    await prisma.product.create({
      data: {
        brandId: brand.id,
        brandName: brand.brandName,
        name: product.name,
        description: product.description,
        longDescription: product.longDescription,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        stockQuantity: product.stockQuantity,
        hasSizes: product.hasSizes,
        sizes: product.sizes,
        images: product.images,
        features: product.features,
        tags: product.tags,
        inStock: product.stockQuantity > 0,
        stockXs: sizeStock.XS || 0,
        stockS: sizeStock.S || 0,
        stockM: sizeStock.M || 0,
        stockL: sizeStock.L || 0,
        stockXl: sizeStock.XL || 0,
        stockXxl: sizeStock.XXL || 0,
        stockXxxl: sizeStock.XXXL || 0,
      },
    });
    console.log(`  ✅ "${product.name}" — ₹${product.price}`);
    created++;
  }

  console.log(`\n🎉 Done! Created ${created} products under "${brand.brandName}".`);
  console.log('\nYou can now view them at: http://localhost:3000/products');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
