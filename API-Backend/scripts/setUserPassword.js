/**
 * Script: Set User Password
 * 
 * This script sets a password for a user
 * Usage:
 *   node scripts/setUserPassword.js email@example.com newpassword
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const setUserPassword = async () => {
  try {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('Usage: node scripts/setUserPassword.js email@example.com newpassword');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found: ${email}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.authType = 'email';
    await user.save();

    console.log(`✓ Password set successfully`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role || 'user'}`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

setUserPassword();
