const { Schema, mongoose } = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand'
  },
  address: { type: String },
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
  subtotal: Number,
  tax: Number,
  shippingFee: Number,
  total: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentId: String,
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
  billing_customer_name: String,
  billing_address: String,
  billing_city: String,
  billing_pincode: String,
  billing_state: String,
  billing_country: String,
  billing_email: String,
  billing_phone: String,
  shipment_id: { type: String, default: "" },
  pickup_location: {
    type: String,
    default: ""
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
