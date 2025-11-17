const { Schema, mongoose } = require('mongoose');

const OrderSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand'
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      title: String,
      category: String,
      size: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    required: true
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  },
  shippingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddressSnapshot: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  shippingId: {
    type: Schema.Types.ObjectId,
    ref: 'Shipping'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
