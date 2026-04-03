const Razorpay = require('razorpay');
require('dotenv').config();
const crypto = require('crypto');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

console.log('[Razorpay Init] KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'LOADED' : 'UNDEFINED');
console.log('[Razorpay Init] KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'LOADED' : 'UNDEFINED');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET — payment features disabled');
}

// Create order
const createOrder = async (amount, currency = 'INR') => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `order_${crypto.randomBytes(8).toString('hex')}`,
      payment_capture: 1
    };

    console.log('[Razorpay] Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('[Razorpay] Order created successfully:', order.id);
    return {
      success: true,
      data: order
    };
  } catch (error) {
    console.error('[Razorpay] Error creating order:', error.message || error);
    console.error('[Razorpay] Error details:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Razorpay order'
    };
  }
};

// Verify payment signature
const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthenticated = expectedSignature === razorpaySignature;

    return {
      success: isAuthenticated,
      message: isAuthenticated ? 'Payment verified successfully' : 'Payment verification failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate webhook signature
const validateWebhook = (webhookBody, webhookSignature) => {
  try {
    const isValid = validateWebhookSignature(
      webhookBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    return {
      success: isValid,
      message: isValid ? 'Webhook signature verified successfully' : 'Invalid webhook signature'
    };
  } catch (error) {
    console.error('[Razorpay] Error validating webhook:', error.message);
    return {
      success: false,
      error: error.message || 'Webhook validation failed'
    };
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  validateWebhook,
  razorpay
};
