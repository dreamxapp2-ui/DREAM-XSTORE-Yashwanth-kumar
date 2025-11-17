const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, validateWebhook } = require('../helpers/razorpayHelper');

/**
 * POST /payment/create-order
 * Create Razorpay order
 * Auth: Not required (frontend handles user authentication)
 * Body: { amount, currency?, description? }
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', description = 'Dream X Store Order' } = req.body;

    console.log('[Payment] Create order request:', { amount, currency, userId: req.user?.userId });

    // Validate amount
    if (!amount || amount <= 0) {
      console.warn('[Payment] Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    console.log(`[Payment] Creating order for amount: ₹${amount}`);

    // Create Razorpay order
    const orderResult = await createOrder(amount, currency);

    if (!orderResult.success) {
      console.error('[Payment] Failed to create order:', orderResult.error);
      return res.status(500).json({
        success: false,
        error: orderResult.error || 'Failed to create order'
      });
    }

    const order = orderResult.data;

    console.log(`[Payment] Order created successfully: ${order.id}`);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('[Payment] Error creating order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order'
    });
  }
});

/**
 * POST /payment/verify
 * Verify payment signature
 * Auth: Not required (signature verification provides security)
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
router.post('/verify', (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Validate inputs
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment details'
      });
    }

    console.log(`[Payment] Verifying payment: ${razorpayPaymentId}`);

    // Verify payment
    const verifyResult = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!verifyResult.success) {
      console.error('[Payment] Verification failed for:', razorpayPaymentId);
      return res.status(400).json({
        success: false,
        error: verifyResult.message || 'Payment verification failed'
      });
    }

    console.log(`[Payment] Payment verified successfully: ${razorpayPaymentId}`);

    res.json({
      success: true,
      message: verifyResult.message,
      data: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId
      }
    });
  } catch (error) {
    console.error('[Payment] Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
});

/**
 * POST /payment/webhook
 * Receive and validate Razorpay webhooks
 * Auth: Not required (webhook signature verification instead)
 * Headers: { x-razorpay-signature }
 * Body: { event, payload }
 */
router.post('/webhook', (req, res) => {
  try {
    const webhookSignature = req.header('x-razorpay-signature');
    const webhookBody = JSON.stringify(req.body);

    // Validate webhook signature
    const validationResult = validateWebhook(webhookBody, webhookSignature);

    if (!validationResult.success) {
      console.error('[Payment] Webhook validation failed:', validationResult.error);
      return res.status(400).json({
        success: false,
        error: validationResult.message || 'Webhook validation failed'
      });
    }

    console.log('[Payment] Webhook received and validated:', req.body.event);

    const { event, payload } = req.body;

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
        console.log('[Payment] Payment authorized:', payload.payment.id);
        // Handle payment authorized event
        break;
      case 'payment.failed':
        console.log('[Payment] Payment failed:', payload.payment.id);
        // Handle payment failed event
        break;
      case 'payment.captured':
        console.log('[Payment] Payment captured:', payload.payment.id);
        // Handle payment captured event
        break;
      case 'order.paid':
        console.log('[Payment] Order paid:', payload.order.id);
        // Handle order paid event
        break;
      case 'refund.created':
        console.log('[Payment] Refund created:', payload.refund.id);
        // Handle refund created event
        break;
      default:
        console.log('[Payment] Unknown event received:', event);
    }

    // Always return success to Razorpay
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('[Payment] Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Webhook processing failed'
    });
  }
});

/**
 * GET /payment/status
 * Health check endpoint
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'Payment API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
