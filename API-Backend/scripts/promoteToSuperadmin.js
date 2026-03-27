/**
 * Promotion Script: Promote a User to Superadmin
 * 
 * Usage:
 *   node scripts/promoteToSuperadmin.js <email>
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promoteToSuperadmin.js <email>');
  process.exit(1);
}

const promote = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    user.role = 'superadmin';
    user.isVerified = true;
    await user.save();

    console.log(`Successfully promoted ${email} to superadmin!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  }
};

promote();
