const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    longDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Brand Reference
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    // Category
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      default: null,
      trim: true,
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Ratings & Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Images
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one image is required',
      },
    },

    // Sizes
    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      default: ['S', 'M', 'L', 'XL', 'XXL'],
    },

    // Stock Management
    hasSizes: {
      type: Boolean,
      default: true, // true = size-based stock, false = default stock (books, digital, etc.)
    },
    sizeStock: {
      type: {
        'XS': { type: Number, default: 0 },
        'S': { type: Number, default: 0 },
        'M': { type: Number, default: 0 },
        'L': { type: Number, default: 0 },
        'XL': { type: Number, default: 0 },
        'XXL': { type: Number, default: 0 },
        'XXXL': { type: Number, default: 0 },
      },
      default: {
        'XS': 0,
        'S': 0,
        'M': 0,
        'L': 0,
        'XL': 0,
        'XXL': 0,
        'XXXL': 0,
      },
    },

    // Stock
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Features & Tags
    features: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },

    // Weight and Dimensions
    weight: {
      type: Number,
      default: null,
    },
    length: {
      type: Number,
      default: null,
    },
    breadth: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update inStock status based on stockQuantity
productSchema.pre('save', function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Pre-updateOne/findByIdAndUpdate middleware to update inStock status
productSchema.pre(['updateOne', 'findByIdAndUpdate'], function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.stockQuantity !== undefined) {
    update.$set.inStock = update.$set.stockQuantity > 0;
  }
  next();
});
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ brandName: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Virtual for calculating actual price after discount
productSchema.virtual('finalPrice').get(function () {
  return Math.round(this.originalPrice * (1 - this.discount / 100));
});

// Ensure virtuals are included in toJSON()
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
