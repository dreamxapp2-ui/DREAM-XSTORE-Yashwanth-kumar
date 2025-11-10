/**
 * Seed Script: Create the First Superadmin
 * 
 * This script creates a single superadmin user in the database.
 * IMPORTANT: Run this only once on an empty database.
 * 
 * Usage:
 *   node scripts/seedSuperadmin.js
 * 
 * Before running:
 *   1. Make sure MongoDB is running
 *   2. Verify .env file has MONGODB_URI and JWT_SECRET
 *   3. Ensure the User collection is empty (or superadmin doesn't exist)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const seedSuperadmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Define superadmin credentials
    const superadminEmail = 'admin@dreamxstore.com';
    const superadminPassword = 'AdminPass@123'; // Change this to a strong password

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ email: superadminEmail });
    if (existingSuperadmin) {
      console.log('⚠ Superadmin already exists. Skipping creation.');
      console.log(`Email: ${existingSuperadmin.email}`);
      console.log(`Role: ${existingSuperadmin.role}`);
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superadminPassword, salt);

    // Create superadmin user
    const superadmin = new User({
      email: superadminEmail,
      password: hashedPassword,
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
      isVerified: true,
      authType: 'email'
    });

    // Save to database
    await superadmin.save();

    console.log('✓ Superadmin created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('SUPERADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log(`Email:    ${superadminEmail}`);
    console.log(`Password: ${superadminPassword}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('IMPORTANT:');
    console.log('1. Save these credentials in a secure location');
    console.log('2. Change the password after first login');
    console.log('3. DO NOT commit this password to version control');
    console.log('4. Use a strong, unique password for production');
    console.log('');

    await mongoose.disconnect();
    console.log('✓ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error creating superadmin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed script
seedSuperadmin();
