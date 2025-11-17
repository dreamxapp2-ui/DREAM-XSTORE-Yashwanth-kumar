const { Schema, mongoose } = require('mongoose');

const ShippingSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  courier: {
    type: String,
    enum: ['fedex', 'ups', 'dhl', 'shiprocket', 'bluedart', 'local'],
    default: 'shiprocket'
  },
  trackingNumber: String,
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  shippingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  events: [
    {
      status: String,
      description: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  estimatedDelivery: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shipping', ShippingSchema);
