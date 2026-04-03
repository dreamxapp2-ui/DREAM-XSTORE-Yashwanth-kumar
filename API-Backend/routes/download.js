const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const designRepo = require('../repositories/designRepository');
const orderRepo = require('../repositories/orderRepository');
const auth = require('../middleware/auth');

// Download design image
router.get('/design/:designId/image/:imageIndex', auth, async (req, res) => {
  try {
    const { designId, imageIndex } = req.params;
    const design = await designRepo.getDesignById(designId);
    
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    // Check if user has permission to download
    if (!design.isPublic && design.designer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const imageIndex_num = parseInt(imageIndex);
    if (imageIndex_num < 0 || imageIndex_num >= design.images.length) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imagePath = design.images[imageIndex_num];
    const fullPath = path.resolve(imagePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Set appropriate headers for download
    const filename = `${design.title}_image_${imageIndex_num + 1}${path.extname(imagePath)}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Download order invoice (if available)
router.get('/order/:orderId/invoice', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderRepo.getOrderByIdDirect(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate invoice data
    const invoiceData = {
      orderId: order._id,
      orderDate: order.createdAt,
      customerName: `${order.shippingAddressSnapshot?.firstName || ''} ${order.shippingAddressSnapshot?.lastName || ''}`.trim(),
      customerEmail: order.shippingAddressSnapshot?.email || req.user.email,
      shippingAddress: order.shippingAddressSnapshot,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shippingFee: order.shippingFee,
      total: order.total,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod
    };

    // Set headers for JSON download
    const filename = `invoice_${order._id}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    res.json(invoiceData);
    
  } catch (error) {
    console.error('Invoice download error:', error);
    res.status(500).json({ error: 'Invoice download failed' });
  }
});

// Download user data (GDPR compliance)
router.get('/user/data', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const userData = await req.user.toObject();
    delete userData.password; // Remove sensitive data
    
    // Get user's orders
    const userOrders = await orderRepo.getOrders(userId, { page: 1, limit: 1000 });
    const orders = userOrders.data || [];
    
    // Get user's designs (if any)
    const designs = await designRepo.getDesignsByDesigner(userId);
    
    const exportData = {
      user: userData,
      orders: orders,
      designs: designs,
      exportDate: new Date().toISOString()
    };

    // Set headers for JSON download
    const filename = `user_data_${userId}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    res.json(exportData);
    
  } catch (error) {
    console.error('User data download error:', error);
    res.status(500).json({ error: 'Data download failed' });
  }
});

// Download product catalog (public)
router.get('/catalog', async (req, res) => {
  try {
    const designs = await designRepo.getPublicDesignsByBrandUsers();

    const catalogData = {
      catalog: designs,
      totalProducts: designs.length,
      exportDate: new Date().toISOString(),
      store: 'Dream X Store'
    };

    // Set headers for JSON download
    const filename = `dreamx_catalog_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    res.json(catalogData);
    
  } catch (error) {
    console.error('Catalog download error:', error);
    res.status(500).json({ error: 'Catalog download failed' });
  }
});

module.exports = router;