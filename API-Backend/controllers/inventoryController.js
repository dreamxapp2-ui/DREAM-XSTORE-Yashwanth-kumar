const Product = require('../models/Product');

/**
 * Reduce product stock after successful order
 * @param {Array} orderItems - Array of { productId, quantity, selectedSize? }
 * @returns {Promise<Object>} - Result of stock reduction
 */
exports.reduceStock = async (orderItems) => {
  try {
    console.log('[Inventory] Reducing stock for order items:', orderItems);
    
    const results = [];
    const errors = [];

    for (const item of orderItems) {
      try {
        const { productId, quantity, selectedSize } = item;

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
          errors.push({
            productId,
            error: 'Product not found',
          });
          continue;
        }

        // Check if product has size-based inventory
        if (product.hasSizes && selectedSize) {
          // Reduce size-specific stock
          const currentSizeStock = product.sizeStock[selectedSize] || 0;

          if (currentSizeStock < quantity) {
            errors.push({
              productId,
              size: selectedSize,
              error: `Insufficient stock. Available: ${currentSizeStock}, Requested: ${quantity}`,
            });
            continue;
          }

          // Update size stock
          product.sizeStock[selectedSize] = currentSizeStock - quantity;

          // Recalculate total stock from all sizes
          const totalStock = Object.values(product.sizeStock).reduce((sum, qty) => sum + qty, 0);
          product.stockQuantity = totalStock;

          await product.save();

          results.push({
            productId,
            size: selectedSize,
            reducedQuantity: quantity,
            remainingStock: product.sizeStock[selectedSize],
            totalStock: product.stockQuantity,
          });

          console.log(`[Inventory] Reduced ${quantity} units of ${product.name} (Size: ${selectedSize}). Remaining: ${product.sizeStock[selectedSize]}`);
        } else {
          // Reduce general stock (no sizes)
          if (product.stockQuantity < quantity) {
            errors.push({
              productId,
              error: `Insufficient stock. Available: ${product.stockQuantity}, Requested: ${quantity}`,
            });
            continue;
          }

          product.stockQuantity -= quantity;
          await product.save();

          results.push({
            productId,
            reducedQuantity: quantity,
            remainingStock: product.stockQuantity,
          });

          console.log(`[Inventory] Reduced ${quantity} units of ${product.name}. Remaining: ${product.stockQuantity}`);
        }
      } catch (error) {
        console.error(`[Inventory] Error processing item ${item.productId}:`, error);
        errors.push({
          productId: item.productId,
          error: error.message,
        });
      }
    }

    if (errors.length > 0) {
      console.warn('[Inventory] Some items had errors:', errors);
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      message: errors.length === 0 
        ? 'Stock reduced successfully' 
        : `Stock reduced with ${errors.length} error(s)`,
    };
  } catch (error) {
    console.error('[Inventory] Error in reduceStock:', error);
    throw error;
  }
};

/**
 * Reserve stock for pending order (optional - for cart checkout)
 * @param {Array} orderItems - Array of { productId, quantity, selectedSize? }
 * @returns {Promise<Object>} - Stock availability check
 */
exports.checkStockAvailability = async (orderItems) => {
  try {
    const availabilityResults = [];
    let allAvailable = true;

    for (const item of orderItems) {
      const { productId, quantity, selectedSize } = item;

      const product = await Product.findById(productId);

      if (!product) {
        availabilityResults.push({
          productId,
          available: false,
          reason: 'Product not found',
        });
        allAvailable = false;
        continue;
      }

      if (product.hasSizes && selectedSize) {
        const sizeStock = product.sizeStock[selectedSize] || 0;
        const available = sizeStock >= quantity;

        availabilityResults.push({
          productId,
          productName: product.name,
          size: selectedSize,
          available,
          requestedQuantity: quantity,
          availableQuantity: sizeStock,
          reason: available ? 'In stock' : `Only ${sizeStock} available`,
        });

        if (!available) allAvailable = false;
      } else {
        const available = product.stockQuantity >= quantity;

        availabilityResults.push({
          productId,
          productName: product.name,
          available,
          requestedQuantity: quantity,
          availableQuantity: product.stockQuantity,
          reason: available ? 'In stock' : `Only ${product.stockQuantity} available`,
        });

        if (!available) allAvailable = false;
      }
    }

    return {
      success: allAvailable,
      allAvailable,
      items: availabilityResults,
      message: allAvailable ? 'All items in stock' : 'Some items out of stock',
    };
  } catch (error) {
    console.error('[Inventory] Error checking stock availability:', error);
    throw error;
  }
};

/**
 * Restore stock (for cancelled/failed orders)
 * @param {Array} orderItems - Array of { productId, quantity, selectedSize? }
 * @returns {Promise<Object>} - Result of stock restoration
 */
exports.restoreStock = async (orderItems) => {
  try {
    console.log('[Inventory] Restoring stock for cancelled order:', orderItems);
    
    const results = [];

    for (const item of orderItems) {
      const { productId, quantity, selectedSize } = item;

      const product = await Product.findById(productId);

      if (!product) {
        console.warn(`[Inventory] Product ${productId} not found for stock restoration`);
        continue;
      }

      if (product.hasSizes && selectedSize) {
        product.sizeStock[selectedSize] = (product.sizeStock[selectedSize] || 0) + quantity;
        const totalStock = Object.values(product.sizeStock).reduce((sum, qty) => sum + qty, 0);
        product.stockQuantity = totalStock;
      } else {
        product.stockQuantity += quantity;
      }

      await product.save();

      results.push({
        productId,
        restoredQuantity: quantity,
        newStock: product.hasSizes && selectedSize 
          ? product.sizeStock[selectedSize] 
          : product.stockQuantity,
      });

      console.log(`[Inventory] Restored ${quantity} units of ${product.name}`);
    }

    return {
      success: true,
      results,
      message: 'Stock restored successfully',
    };
  } catch (error) {
    console.error('[Inventory] Error restoring stock:', error);
    throw error;
  }
};
