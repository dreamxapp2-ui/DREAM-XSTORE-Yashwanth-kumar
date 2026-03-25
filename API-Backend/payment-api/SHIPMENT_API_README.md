# Shipment API Documentation

This directory contains the Shipment API implementation integrated with the Payment API service.

## Overview

The Shipment API provides endpoints for managing shipping and logistics through Shiprocket integration. It handles pickup locations, delivery pricing, order creation, tracking, and more.

## Environment Variables

Add these to your `.env` file in the payment-api directory:

```env
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
```

## API Endpoints

Base URL: `http://localhost:3001/shipment`

### 1. Add Pickup Location
**Endpoint:** `POST /shipment/add-pickup-location`  
**Auth:** Required  
**Body:**
```json
{
  "pickup_location": "Warehouse A",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "address": "123 Main Street",
  "address_2": "Floor 2",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pin_code": "400001"
}
```

### 2. Get Delivery Price
**Endpoint:** `GET /shipment/delivery-price`  
**Auth:** Not Required  
**Query Parameters:**
- `pickup_postcode` (required): Pickup location pincode
- `delivery_postcode` (required): Delivery location pincode
- `weight` (required): Package weight in kg
- `cod` (optional): Cash on delivery (true/false)
- `length` (optional): Package length in cm
- `breadth` (optional): Package breadth in cm
- `height` (optional): Package height in cm

**Example:**
```
GET /shipment/delivery-price?pickup_postcode=400001&delivery_postcode=560001&weight=0.5&cod=false
```

### 3. Create Shipment Order
**Endpoint:** `POST /shipment/create-order`  
**Auth:** Required  
**Body:**
```json
{
  "order_id": "ORD-12345",
  "order_date": "2025-11-18",
  "pickup_location": "Warehouse A",
  "billing_customer_name": "Jane",
  "billing_last_name": "Smith",
  "billing_address": "456 Park Avenue",
  "billing_city": "Bangalore",
  "billing_state": "Karnataka",
  "billing_country": "India",
  "billing_pincode": "560001",
  "billing_email": "jane@example.com",
  "billing_phone": "8888888888",
  "shipping_is_billing": true,
  "order_items": [
    {
      "name": "T-Shirt",
      "sku": "TSHIRT-001",
      "units": 2,
      "selling_price": 500
    }
  ],
  "payment_method": "Prepaid",
  "sub_total": 1000,
  "weight": 0.5,
  "length": 25,
  "breadth": 20,
  "height": 5
}
```

### 4. Assign AWB Number
**Endpoint:** `POST /shipment/assign-awb`  
**Auth:** Required  
**Body:**
```json
{
  "shipment_id": 123456,
  "courier_id": 12
}
```

### 5. Request Pickup
**Endpoint:** `POST /shipment/request-pickup`  
**Auth:** Required  
**Body:**
```json
{
  "shipment_id": 123456,
  "pickup_date": ["2025-11-19"]
}
```

### 6. Track Shipment by ID
**Endpoint:** `GET /shipment/track/:shipmentId`  
**Auth:** Not Required  
**Example:**
```
GET /shipment/track/123456
```

### 7. Track Shipment by AWB
**Endpoint:** `GET /shipment/track-awb/:awbCode`  
**Auth:** Not Required  
**Example:**
```
GET /shipment/track-awb/ABCD1234567890
```

### 8. Get All Orders
**Endpoint:** `GET /shipment/orders`  
**Auth:** Required  
**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `status` (optional): Filter by status

**Example:**
```
GET /shipment/orders?page=1&per_page=20&status=DELIVERED
```

### 9. Get Delivered Orders
**Endpoint:** `GET /shipment/delivered-orders`  
**Auth:** Required

### 10. Cancel Shipment
**Endpoint:** `POST /shipment/cancel`  
**Auth:** Required  
**Body:**
```json
{
  "shipment_ids": [123456, 123457]
}
```

### 11. Health Check
**Endpoint:** `GET /shipment/status`  
**Auth:** Not Required

## Response Format

All endpoints return JSON responses in this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Integration Flow

### Complete Order Flow with Payment and Shipment

1. **Customer Places Order**
   - Frontend collects order details
   - Calculates delivery price using `/shipment/delivery-price`

2. **Process Payment**
   - Create payment order using `/payment/create-order`
   - Customer completes payment
   - Verify payment using `/payment/verify`

3. **Create Shipment**
   - After successful payment verification
   - Create shipment order using `/shipment/create-order`
   - Receive `shipment_id` in response

4. **Assign Courier**
   - Assign AWB using `/shipment/assign-awb`
   - Receive AWB code

5. **Request Pickup**
   - Schedule pickup using `/shipment/request-pickup`

6. **Track Order**
   - Customer can track using `/shipment/track/:shipmentId` or `/shipment/track-awb/:awbCode`

## Error Handling

The API includes comprehensive error handling:
- Missing required fields return 400 Bad Request
- Authentication failures return 401 Unauthorized
- Shiprocket API errors are caught and returned with descriptive messages
- Token caching prevents authentication rate limits

## Token Management

The Shiprocket API token is automatically:
- Fetched on first request
- Cached for 23 hours
- Refreshed when expired

## Files Structure

```
payment-api/
├── helpers/
│   ├── razorpayHelper.js    # Razorpay payment integration
│   └── shiprocketHelper.js  # Shiprocket shipping integration
├── routes/
│   ├── payment.js           # Payment routes
│   └── shipment.js          # Shipment routes
├── middleware/
│   └── auth.js              # Authentication middleware
└── app.js                   # Main app configuration
```

## Testing

Use the provided endpoints to test the shipment flow:

1. Test delivery price calculation (no auth required)
2. Add a pickup location (requires auth)
3. Create a test shipment order (requires auth)
4. Track the shipment using shipment ID or AWB

## Notes

- All authenticated routes require JWT token in Authorization header
- Tracking endpoints are public and don't require authentication
- Delivery price endpoint is public for customer estimation
- Weight should be in kilograms, dimensions in centimeters
- Dates should be in YYYY-MM-DD format

## Support

For Shiprocket API documentation, visit: https://apidocs.shiprocket.in/

---

**Last Updated:** November 18, 2025
