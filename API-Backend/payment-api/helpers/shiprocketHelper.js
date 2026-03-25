// shiprocketHelper.js - Shiprocket API integration helper

const axios = require('axios');

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Authenticate and retrieve the API token with caching
 * @returns {Promise<string>} - Authentication token
 */
async function getShiprocketToken() {
  // Check if token is still valid (cache for 23 hours)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_API_BASE}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    cachedToken = response.data.token;
    // Set expiry to 23 hours from now
    tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
    
    console.log('[Shiprocket] Token refreshed successfully');
    return cachedToken;
  } catch (error) {
    console.error('[Shiprocket] Authentication failed:', error.response?.data || error.message);
    throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Add a new pickup location
 * @param {Object} locationData - Details of the pickup location
 * @returns {Promise<Object>} - API response
 */
async function addPickupLocation(locationData) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.post(
      `${SHIPROCKET_API_BASE}/settings/company/addpickup`,
      locationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[Shiprocket] Add pickup location failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Get delivery price between pickup and delivery pincodes
 * @param {Object} params - Parameters including pickup_postcode, delivery_postcode, weight, etc.
 * @returns {Promise<Object>} - Delivery price details
 */
async function getDeliveryPrice(params) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.get(
      `${SHIPROCKET_API_BASE}/courier/serviceability/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      }
    );

    const companies = response.data?.data?.available_courier_companies;

    if (!companies || companies.length === 0) {
      return {
        success: false,
        error: 'No courier options available for this route',
      };
    }

    // Return the cheapest option (first one, as they're sorted by price)
    const cheapest = companies[0];

    return {
      success: true,
      data: {
        courier_name: cheapest.courier_name,
        courier_company_id: cheapest.courier_company_id,
        estimated_delivery_days: cheapest.estimated_delivery_days,
        estimated_delivery_date: cheapest.etd,
        delivery_cost: cheapest.rate,
        cod_charges: cheapest.cod_charges || 0,
        all_options: companies.slice(0, 5), // Return top 5 options
      },
    };
  } catch (error) {
    console.error('[Shiprocket] Get delivery price failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Create a new order on Shiprocket
 * @param {Object} orderData - Details of the order
 * @returns {Promise<Object>} - API response with shipment details
 */
async function createOrder(orderData) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.post(
      `${SHIPROCKET_API_BASE}/orders/create/adhoc`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: {
        order_id: response.data.order_id,
        shipment_id: response.data.shipment_id,
        status: response.data.status,
        status_code: response.data.status_code,
        onboarding_completed_now: response.data.onboarding_completed_now,
      },
    };
  } catch (error) {
    console.error('[Shiprocket] Create order failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors || null,
    };
  }
}

/**
 * Request pickup for a shipment
 * @param {Object} pickupData - Pickup request data
 * @returns {Promise<Object>} - API response
 */
async function requestPickup(pickupData) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.post(
      `${SHIPROCKET_API_BASE}/courier/generate/pickup`,
      pickupData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[Shiprocket] Request pickup failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Assign AWB (Airway Bill) number to shipment
 * @param {number} shipmentId - ID of the shipment
 * @param {number} courierId - Courier company ID
 * @returns {Promise<Object>} - API response
 */
async function assignAWB(shipmentId, courierId) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.post(
      `${SHIPROCKET_API_BASE}/courier/assign/awb`,
      {
        shipment_id: shipmentId,
        courier_id: courierId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: {
        awb_code: response.data.response?.data?.awb_code,
        courier_name: response.data.response?.data?.courier_name,
        shipment_id: shipmentId,
      },
    };
  } catch (error) {
    console.error('[Shiprocket] Assign AWB failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Get tracking details using shipment ID
 * @param {number} shipmentId - ID of the shipment
 * @returns {Promise<Object>} - API response
 */
async function getTrackingByShipmentId(shipmentId) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.get(
      `${SHIPROCKET_API_BASE}/courier/track/shipment/${shipmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[Shiprocket] Get tracking failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Get tracking details using AWB number
 * @param {string} awbCode - AWB tracking number
 * @returns {Promise<Object>} - API response
 */
async function getTrackingByAWB(awbCode) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.get(
      `${SHIPROCKET_API_BASE}/courier/track/awb/${awbCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[Shiprocket] Get tracking by AWB failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Get all orders from Shiprocket
 * @param {Object} filters - Optional filters (page, per_page, status, etc.)
 * @returns {Promise<Object>} - API response
 */
async function getAllOrders(filters = {}) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.get(
      `${SHIPROCKET_API_BASE}/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filters,
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[Shiprocket] Get all orders failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Cancel a shipment
 * @param {Array<number>} shipmentIds - Array of shipment IDs to cancel
 * @returns {Promise<Object>} - API response
 */
async function cancelShipment(shipmentIds) {
  try {
    const token = await getShiprocketToken();
    const response = await axios.post(
      `${SHIPROCKET_API_BASE}/orders/cancel/shipment/awbs`,
      { awbs: shipmentIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[Shiprocket] Cancel shipment failed:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

module.exports = {
  getShiprocketToken,
  addPickupLocation,
  getDeliveryPrice,
  createOrder,
  requestPickup,
  assignAWB,
  getTrackingByShipmentId,
  getTrackingByAWB,
  getAllOrders,
  cancelShipment,
};
