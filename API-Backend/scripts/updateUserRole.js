/**
 * Script: Update User Role
 * 
 * This script updates the role of a user by email
 * Usage:
 *   node scripts/updateUserRole.js email@example.com admin
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const updateUserRole = async () => {
  try {
    const email = process.argv[2];
    const newRole = process.argv[3];

    if (!email || !newRole) {
      console.error('Usage: node scripts/updateUserRole.js email@example.com admin');
      console.error('Valid roles: user, admin, superadmin');
      process.exit(1);
    }

    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(newRole)) {
      console.error(`Invalid role: ${newRole}`);
      console.error(`Valid roles: ${validRoles.join(', ')}`);
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

    const oldRole = user.role || 'user';
    user.role = newRole;
    await user.save();

    console.log(`✓ User role updated`);
    console.log(`Email: ${email}`);
    console.log(`Old Role: ${oldRole}`);
    console.log(`New Role: ${newRole}`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateUserRole();
