const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerEmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'India',
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended', 'Rejected'],
    default: 'Pending',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  productCount: {
    type: Number,
    default: 0,
  },
  commissionRate: {
    type: Number,
    default: 20,
  },
  profileImage: {
    type: Buffer,
    default: null,
  },
  profileImageContentType: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000,
  },
  followerCount: {
    type: Number,
    default: 0,
  },
  socialLinks: {
    instagram: {
      type: String,
      default: null,
      trim: true,
    },
    facebook: {
      type: String,
      default: null,
      trim: true,
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
