const express = require('express');
const router = express.Router();
const shiprocketHelper = require('../helpers/shiprocketHelper');
const auth = require('../middleware/auth');

/**
 * POST /shipment/add-pickup-location
 * Add a new pickup location for shipments
 * Auth: Required
 * Body: { pickup_location, name, email, phone, address, city, state, country, pin_code }
 */
router.post('/add-pickup-location', auth, async (req, res) => {
  try {
    const {
      pickup_location,
      name,
      email,
      phone,
      address,
      address_2,
      city,
      state,
      country,
      pin_code,
    } = req.body;

    // Validate required fields
    if (!pickup_location || !name || !email || !phone || !address || !city || !state || !country || !pin_code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    console.log('[Shipment] Adding pickup location:', pickup_location);

    const result = await shiprocketHelper.addPickupLocation(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Pickup location added successfully');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error adding pickup location:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add pickup location',
    });
  }
});

/**
 * GET /shipment/delivery-price
 * Get delivery price estimate
 * Auth: Not required (public estimate)
 * Query: { pickup_postcode, delivery_postcode, cod, weight, length, breadth, height }
 */
router.get('/delivery-price', async (req, res) => {
  try {
    const {
      pickup_postcode,
      delivery_postcode,
      cod,
      weight,
      length,
      breadth,
      height,
    } = req.query;

    // Validate required fields
    if (!pickup_postcode || !delivery_postcode || !weight) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: pickup_postcode, delivery_postcode, weight',
      });
    }

    console.log('[Shipment] Getting delivery price:', {
      pickup_postcode,
      delivery_postcode,
      weight,
    });

    const params = {
      pickup_postcode: parseInt(pickup_postcode),
      delivery_postcode: parseInt(delivery_postcode),
      cod: cod === 'true' || cod === true,
      weight: parseFloat(weight),
    };

    // Add dimensions if provided
    if (length) params.length = parseFloat(length);
    if (breadth) params.breadth = parseFloat(breadth);
    if (height) params.height = parseFloat(height);

    const result = await shiprocketHelper.getDeliveryPrice(params);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Delivery price retrieved successfully');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error getting delivery price:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get delivery price',
    });
  }
});

/**
 * POST /shipment/create-order
 * Create a shipment order on Shiprocket
 * Auth: Required
 * Body: Full order details including billing, shipping, items, dimensions
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    const requiredFields = [
      'order_id',
      'order_date',
      'pickup_location',
      'billing_customer_name',
      'billing_address',
      'billing_city',
      'billing_pincode',
      'billing_state',
      'billing_country',
      'billing_email',
      'billing_phone',
      'order_items',
      'payment_method',
      'sub_total',
    ];

    const missingFields = requiredFields.filter(field => !orderData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missing_fields: missingFields,
      });
    }

    console.log('[Shipment] Creating order:', orderData.order_id);

    const result = await shiprocketHelper.createOrder(orderData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Order created successfully:', result.data.shipment_id);

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error creating order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create shipment order',
    });
  }
});

/**
 * POST /shipment/assign-awb
 * Assign AWB number to shipment
 * Auth: Required
 * Body: { shipment_id, courier_id }
 */
router.post('/assign-awb', auth, async (req, res) => {
  try {
    const { shipment_id, courier_id } = req.body;

    if (!shipment_id || !courier_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: shipment_id, courier_id',
      });
    }

    console.log('[Shipment] Assigning AWB to shipment:', shipment_id);

    const result = await shiprocketHelper.assignAWB(shipment_id, courier_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] AWB assigned successfully:', result.data.awb_code);

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error assigning AWB:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign AWB',
    });
  }
});

/**
 * POST /shipment/request-pickup
 * Request pickup for a shipment
 * Auth: Required
 * Body: { shipment_id, pickup_date? }
 */
router.post('/request-pickup', auth, async (req, res) => {
  try {
    const { shipment_id, pickup_date } = req.body;

    if (!shipment_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: shipment_id',
      });
    }

    console.log('[Shipment] Requesting pickup for shipment:', shipment_id);

    const pickupData = { shipment_id };
    if (pickup_date) {
      pickupData.pickup_date = Array.isArray(pickup_date) ? pickup_date : [pickup_date];
    }

    const result = await shiprocketHelper.requestPickup(pickupData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Pickup requested successfully');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error requesting pickup:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to request pickup',
    });
  }
});

/**
 * GET /shipment/track/:shipmentId
 * Get tracking details by shipment ID
 * Auth: Not required (tracking is public with ID)
 * Params: { shipmentId }
 */
router.get('/track/:shipmentId', async (req, res) => {
  try {
    const { shipmentId } = req.params;

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing shipment ID',
      });
    }

    console.log('[Shipment] Tracking shipment:', shipmentId);

    const result = await shiprocketHelper.getTrackingByShipmentId(shipmentId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    console.log('[Shipment] Tracking details retrieved');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track shipment',
    });
  }
});

/**
 * GET /shipment/track-awb/:awbCode
 * Get tracking details by AWB number
 * Auth: Not required (tracking is public with AWB)
 * Params: { awbCode }
 */
router.get('/track-awb/:awbCode', async (req, res) => {
  try {
    const { awbCode } = req.params;

    if (!awbCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing AWB code',
      });
    }

    console.log('[Shipment] Tracking by AWB:', awbCode);

    const result = await shiprocketHelper.getTrackingByAWB(awbCode);

    if (!result.success) {
      return res.status(404).json(result);
    }

    console.log('[Shipment] Tracking details retrieved');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error tracking by AWB:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track shipment',
    });
  }
});

/**
 * GET /shipment/orders
 * Get all shipment orders
 * Auth: Required
 * Query: { page?, per_page?, status? }
 */
router.get('/orders', auth, async (req, res) => {
  try {
    const filters = {};

    if (req.query.page) filters.page = parseInt(req.query.page);
    if (req.query.per_page) filters.per_page = parseInt(req.query.per_page);
    if (req.query.status) filters.status = req.query.status;

    console.log('[Shipment] Getting all orders with filters:', filters);

    const result = await shiprocketHelper.getAllOrders(filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Orders retrieved successfully');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error getting orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get orders',
    });
  }
});

/**
 * GET /shipment/delivered-orders
 * Get all delivered orders
 * Auth: Required
 */
router.get('/delivered-orders', auth, async (req, res) => {
  try {
    console.log('[Shipment] Getting delivered orders');

    const result = await shiprocketHelper.getAllOrders({ status: 'DELIVERED' });

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Delivered orders retrieved');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error getting delivered orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get delivered orders',
    });
  }
});

/**
 * POST /shipment/cancel
 * Cancel a shipment
 * Auth: Required
 * Body: { shipment_ids: [1, 2, 3] }
 */
router.post('/cancel', auth, async (req, res) => {
  try {
    const { shipment_ids } = req.body;

    if (!shipment_ids || !Array.isArray(shipment_ids) || shipment_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid shipment_ids array',
      });
    }

    console.log('[Shipment] Cancelling shipments:', shipment_ids);

    const result = await shiprocketHelper.cancelShipment(shipment_ids);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('[Shipment] Shipments cancelled successfully');

    res.json(result);
  } catch (error) {
    console.error('[Shipment] Error cancelling shipment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel shipment',
    });
  }
});

/**
 * GET /shipment/status
 * Health check endpoint
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'Shipment API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
