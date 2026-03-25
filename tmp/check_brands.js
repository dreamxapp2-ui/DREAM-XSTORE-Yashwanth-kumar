const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'API-Backend', '.env') });

const Brand = require('./API-Backend/models/Brand');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function checkBrands() {
  try {
    const dotenvPath = path.join(process.cwd(), 'API-Backend', '.env');
    console.log('Loading .env from:', dotenvPath);
    require('dotenv').config({ path: dotenvPath });

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env');
    }

    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const brands = await Brand.find({});
    console.log(`Found ${brands.length} brands:`);
    brands.forEach(b => {
      console.log(`- Brand: ${b.brandName}, Email: ${b.ownerEmail}, Status: ${b.status}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error in checkBrands:', error);
    process.exit(1);
  }
}

checkBrands();
