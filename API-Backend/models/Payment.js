const { Schema, mongoose } = require('mongoose');

const PaymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  provider: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal'],
    default: 'razorpay'
  },
  transactionId: {
    type: String,
    unique: true
  },
  signature: String,
  failureReason: String,
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'full'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
