// shiprocket.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const shiprocketHelper = require('../helpers/shiprocket_helper');
const order = require('../models/Order'); 
const auth = require('../middleware/auth_pay');

// Replace with your Shiprocket API credentials
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;


// GET tracking info by shipment_id to extract order_id
async function getOrderIdByShipment(shipment_id) {
   let tk = shiprocketHelper.checktoken();

  const resp = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`,
    { 
      
       headers: {
          Authorization: `Bearer ${tk}`,
        }
    
  
  }
  );
  return resp.data.tracking_data.shipment_track[0].order_id;
}

// POST invoice generation
async function generateInvoice(order_id,token) {
  const resp = await axios.post(
    `https://apiv2.shiprocket.in/v1/external/orders/print/invoice`,
    { ids: [order_id] },
    {    headers: {
          Authorization: `Bearer ${token}`,
        } }
  );
  return resp.data.invoice_url; // example: https://… .pdf
}

router.post('/invoice', async (req, res) => {
  try {
    const { shipment_id } = req.body;
    if (!shipment_id) return res.status(400).json({ error: 'shipment_id is required' });

     let tk = shiprocketHelper.checktoken();

    if(tk == null){
      tk = await shiprocketHelper.authenticate(SHIPROCKET_EMAIL,SHIPROCKET_PASSWORD);
    }
    console.log("tk")
    console.log(tk)
    if(tk == null){
         res.status(500).json({ error: "Not authorized" }); 
    }

    const order_id = await getOrderIdByShipment(shipment_id);
    if (!order_id) return res.status(404).json({ error: 'Order not found for shipment_id' });

    const invoiceUrl = await generateInvoice(order_id,tk);

    return res.json({ shipment_id, order_id, invoice_url: invoiceUrl });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message
    });
  }
});

// Middleware to ensure authentication
router.use(async (req, res, next) => {
  try {
    if (!shiprocketHelper.token) {
      await shiprocketHelper.authenticate(SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD);
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add a new pickup location.
 */
router.post('/add-pickup-location', async (req, res) => {
  try {
    const response = await shiprocketHelper.addPickupLocation(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get delivery price between pincodes.
 */
router.post('/get-delivery-price', async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode } = req.body; 
    let tk = shiprocketHelper.checktoken();

    if(tk == null){
      tk = await shiprocketHelper.authenticate(SHIPROCKET_EMAIL,SHIPROCKET_PASSWORD);
    }

    if(tk == null){
         res.status(500).json({ error: "Not authorized" }); 
    }

    console.log(pickup_postcode)
    console.log(delivery_postcode)
    
    const response = await shiprocketHelper.getDeliveryPrice({
      pickup_postcode,
      delivery_postcode,
      cod:0,
	    weight:"0.500"
    });
    console.log(response)
    res.json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});

/**
 * Place a new order.
 */
router.post('/place-order', async (req, res) => {
  try {
    const response = await shiprocketHelper.createOrder(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Request pickup for a shipment.
 */
router.post('/request-pickup', async (req, res) => {
  try {
    const { shipment_id } = req.body;
    const response = await shiprocketHelper.requestPickup(shipment_id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get tracking details for a shipment.
 */
router.get('/track-shipment/:shipmentId', async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const response = await shiprocketHelper.getTrackingDetails(shipmentId);
    console.log(response)
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all delivered orders.
 */
router.get('/delivered-orders', async (req, res) => {
  try {
    const allOrders = await shiprocketHelper.getAllOrders();
    const deliveredOrders = allOrders.data.filter(order => order.orderStatus === 'delivered' || order.status === 'Delivered');
    res.json(deliveredOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * Get sales data for a vendor.
 * Expects: { vendorid }
 * Returns: [{ date, amount }], totalPayment
 */
router.post('/vendor-sales',auth, async (req, res) => {
  try {
    // const { vendorid } = req.body;
    let vendorid = req.user._id

    if (!vendorid) {
      return res.status(400).json({ error: 'vendorid is required' });
    }

    // Debug: print all orders for this vendor
    const vendorOrders = await order.find({ brandId: vendorid });
    // console.log('Vendor Orders:', vendorOrders);
    const orderCount = vendorOrders.length;

    // Aggregate sales data grouped by date for the vendor
    const salesData = await order.aggregate([
      { $match: { brandId: vendorid } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$subtotal" }
        }
      },
      { $project: { date: "$_id", amount: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]);

    // Aggregate total payment for the vendor
    const totalResult = await order.aggregate([
      { $match: { brandId: vendorid } },
      { $group: { _id: null, totalPayment: { $sum: "$subtotal" } } }
    ]);
    
    // console.log(salesData)
    // console.log(totalResult)
    res.json({
      sales: salesData,
      totalPayment: totalResult[0]?.totalPayment || 0,
      orderCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * Get orders list for a vendor.
 * Expects: { vendorid } (from auth middleware)
 * Returns: [{ subtotal, shipmentid, date }]
 */
router.post('/vendor-orders', auth, async (req, res) => {
  try {
    const vendorid = req.user._id;
    if (!vendorid) {
      return res.status(400).json({ error: 'vendorid is required' });
    }

    const orders = await order.find(
      { brandId: vendorid },
      { subtotal: 1, shipment_id: 1, createdAt: 1, items: 1, _id: 0 }
    ).sort({ createdAt: -1 });

    const result = orders.map(o => ({
      subtotal: o.subtotal,
      shipmentid: o.shipment_id,
      date: o.createdAt,
      items: o.items?.map(item => ({
      title: item.title,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      _id: item._id
      })) || []
    }));

    console.log(result)

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
