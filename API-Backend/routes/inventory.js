const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

/**
 * POST /api/inventory/reduce-stock
 * Reduce stock after successful order
 * Auth: Required
 * Body: { orderItems: [{ productId, quantity, selectedSize? }] }
 */
router.post('/reduce-stock', auth, async (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required',
      });
    }

    console.log('[Inventory API] Reducing stock for order:', { orderItems });

    const result = await inventoryController.reduceStock(orderItems);

    if (!result.success) {
      console.warn('[Inventory API] Stock reduction had errors:', result.errors);
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Inventory API] Error reducing stock:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reduce stock',
    });
  }
});

/**
 * POST /api/inventory/check-availability
 * Check stock availability before checkout
 * Auth: Not required (pre-checkout validation)
 * Body: { orderItems: [{ productId, quantity, selectedSize? }] }
 */
router.post('/check-availability', async (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required',
      });
    }

    const result = await inventoryController.checkStockAvailability(orderItems);

    res.json(result);
  } catch (error) {
    console.error('[Inventory API] Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check stock availability',
    });
  }
});

/**
 * POST /api/inventory/restore-stock
 * Restore stock for cancelled/failed orders
 * Auth: Required
 * Body: { orderItems: [{ productId, quantity, selectedSize? }] }
 */
router.post('/restore-stock', auth, async (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required',
      });
    }

    console.log('[Inventory API] Restoring stock for cancelled order:', { orderItems });

    const result = await inventoryController.restoreStock(orderItems);

    res.json(result);
  } catch (error) {
    console.error('[Inventory API] Error restoring stock:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to restore stock',
    });
  }
});

module.exports = router;
