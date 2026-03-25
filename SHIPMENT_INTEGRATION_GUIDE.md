# Shipment Integration Guide

## Overview

This guide covers the complete shipment integration using Shiprocket API, integrated with the payment system to provide end-to-end order fulfillment functionality.

---

## Architecture

```
Customer Order Flow:
1. Customer adds products to cart
2. Proceeds to checkout (shipping + payment info)
3. Payment processed via Razorpay
4. Payment verified on backend
5. Shipment order created on Shiprocket
6. AWB assigned & pickup requested
7. Customer can track shipment
```

---

## Backend Implementation

### 1. Shipment API (payment-api service)

**Location:** `API-Backend/payment-api/`

#### Files Created:

- **`helpers/shiprocketHelper.js`** - Shiprocket API integration
- **`routes/shipment.js`** - Shipment API routes
- **`SHIPMENT_API_README.md`** - API documentation

#### Environment Setup:

Add to `API-Backend/payment-api/.env`:

```env
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
```

#### API Endpoints:

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/shipment/delivery-price` | GET | No | Calculate delivery cost |
| `/shipment/create-order` | POST | Yes | Create shipment order |
| `/shipment/assign-awb` | POST | Yes | Assign AWB number |
| `/shipment/request-pickup` | POST | Yes | Schedule pickup |
| `/shipment/track/:shipmentId` | GET | No | Track by shipment ID |
| `/shipment/track-awb/:awbCode` | GET | No | Track by AWB code |
| `/shipment/orders` | GET | Yes | Get all shipments |
| `/shipment/delivered-orders` | GET | Yes | Get delivered orders |
| `/shipment/cancel` | POST | Yes | Cancel shipment |
| `/shipment/add-pickup-location` | POST | Yes | Add pickup location |

---

## Frontend Implementation

### 1. Shipment Service

**Location:** `Dreamxstore/src/lib/api/shipmentService.ts`

#### Features:

- Calculate delivery pricing
- Create shipment orders
- Track shipments
- Manage AWB assignment
- Request pickups
- Cancel shipments

#### Usage Example:

```typescript
import ShipmentService from '@/src/lib/api/shipmentService';

// Get delivery price
const deliveryPrice = await ShipmentService.getDeliveryPrice({
  pickup_postcode: 400001,
  delivery_postcode: 560001,
  weight: 0.5,
  cod: false,
});

// Create shipment order
const shipment = await ShipmentService.createShipmentOrder({
  order_id: 'ORD-12345',
  order_date: '2025-11-18',
  pickup_location: 'Main Warehouse',
  // ... other order details
});

// Track shipment
const tracking = await ShipmentService.trackByShipmentId(shipmentId);
```

### 2. Order Tracking Component

**Location:** `Dreamxstore/src/components/orders/OrderTracking.tsx`

#### Features:

- Real-time tracking display
- Timeline visualization
- Status updates
- Delivery estimation
- Refresh functionality

#### Usage:

```tsx
import OrderTracking from '@/src/components/orders/OrderTracking';

<OrderTracking 
  shipmentId={123456} 
  // OR
  awbCode="ABCD1234567890"
/>
```

### 3. Checkout Integration

**Location:** `Dreamxstore/src/components/checkout/review-order.tsx`

#### Integrated Flow:

1. **Payment Processing**
   - Create Razorpay order
   - Open payment modal
   - Verify payment signature

2. **Shipment Creation** (After successful payment)
   - Prepare order data
   - Calculate weight (default: 0.5kg per item)
   - Create shipment on Shiprocket
   - Store shipment ID
   - Show success notification

3. **Error Handling**
   - Payment verified but shipment fails → Warning notification
   - Customer notified to contact support
   - Order still marked as paid

---

## Complete Order Flow

### Step-by-Step Process

#### 1. Customer Checkout

```typescript
// In checkout page
<ReviewOrder 
  shippingData={shippingData}
  paymentData={paymentData}
  onComplete={() => router.push('/orders')}
/>
```

#### 2. Payment Processing

```typescript
// Payment Service creates Razorpay order
const order = await PaymentService.createOrderAndOpenCheckout(
  totalAmount,
  onSuccess,
  onError
);
```

#### 3. Payment Verification

```typescript
// Verify payment signature
const verifyResponse = await PaymentService.verifyPayment(
  orderId,
  paymentId,
  signature
);
```

#### 4. Shipment Creation

```typescript
// Create shipment order on Shiprocket
const shipmentData = {
  order_id: razorpayOrderId,
  order_date: new Date().toISOString().split('T')[0],
  pickup_location: 'Main Warehouse',
  billing_customer_name: shippingData.firstName,
  billing_last_name: shippingData.lastName,
  billing_address: shippingData.address,
  billing_city: shippingData.city,
  billing_state: shippingData.state,
  billing_country: 'India',
  billing_pincode: shippingData.postalCode,
  billing_email: shippingData.email,
  billing_phone: shippingData.phone,
  shipping_is_billing: true,
  order_items: cart.map(item => ({
    name: item.title,
    sku: item._id,
    units: item.quantity,
    selling_price: item.price,
  })),
  payment_method: 'Prepaid',
  sub_total: getTotalPrice(),
  weight: calculateTotalWeight(), // 0.5kg per item
  length: 30,
  breadth: 20,
  height: 10,
};

const shipment = await ShipmentService.createShipmentOrder(shipmentData);
```

#### 5. Post-Shipment Actions (Optional/Admin)

```typescript
// Assign AWB number
const awb = await ShipmentService.assignAWB(shipmentId, courierId);

// Request pickup
const pickup = await ShipmentService.requestPickup(shipmentId);
```

#### 6. Customer Tracking

```typescript
// Customer can track their order
<OrderTracking shipmentId={shipmentId} />
```

---

## Configuration

### 1. Payment API Setup

```bash
cd API-Backend/payment-api
npm install
```

Add environment variables to `.env`:

```env
PORT=3001
JWT_SECRET=c747ae0d6c461d6d6d4ef6130576c9961dae0a47c5937472cae8a03f6f58c11
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
```

Start the server:

```bash
npm start
# Runs on http://localhost:3001
```

### 2. Frontend Setup

Add to `Dreamxstore/.env.local`:

```env
NEXT_PUBLIC_PAY_API_URL=http://localhost:3001
```

### 3. Shiprocket Setup

1. Create account at https://www.shiprocket.in/
2. Get API credentials (email + password)
3. Add pickup location via API or dashboard
4. Configure courier preferences

---

## Testing

### 1. Test Delivery Price Calculation

```bash
curl "http://localhost:3001/shipment/delivery-price?pickup_postcode=400001&delivery_postcode=560001&weight=0.5&cod=false"
```

### 2. Test Complete Flow

1. Add products to cart
2. Go to checkout
3. Fill shipping details
4. Fill payment details
5. Click "Place Order"
6. Payment modal opens (Razorpay)
7. Complete payment (test mode)
8. Payment verified ✓
9. Shipment created ✓
10. Success notification
11. Redirect to orders page

### 3. Test Tracking

```bash
curl "http://localhost:3001/shipment/track/123456"
```

---

## Error Handling

### Common Scenarios:

#### 1. Payment Success but Shipment Fails

```typescript
// Order is marked as paid
// Warning toast shown to customer
// Admin notified to create shipment manually
showToast('Order placed but shipment creation failed. Contact support.', 'warning');
```

#### 2. Invalid Pickup Location

```typescript
// Error: Pickup location not found
// Solution: Add pickup location first via API
await ShipmentService.addPickupLocation({
  pickup_location: 'Main Warehouse',
  name: 'Store Manager',
  email: 'manager@store.com',
  phone: '9999999999',
  address: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  pin_code: '400001',
});
```

#### 3. Courier Not Available

```typescript
// Delivery price returns no courier options
// Solution: Check if route is serviceable
// Consider adjusting package weight/dimensions
```

---

## Admin Features (To Be Implemented)

### 1. Shipment Management Dashboard

- View all shipments
- Filter by status (pending, shipped, delivered)
- Assign AWB numbers
- Request pickups
- Track multiple shipments
- Generate shipping labels

### 2. Pickup Location Management

- Add/edit pickup locations
- Set default pickup location
- Manage multiple warehouses

### 3. Shipping Reports

- Delivery performance metrics
- Courier comparison
- Shipping costs analysis
- Delayed shipments

---

## Data Models

### Shipment Order Data

```typescript
interface ShipmentOrderData {
  order_id: string;              // Razorpay order ID
  order_date: string;            // YYYY-MM-DD
  pickup_location: string;       // Registered location
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_pincode: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: OrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  weight: number;                // in kg
  length?: number;               // in cm
  breadth?: number;              // in cm
  height?: number;               // in cm
}
```

### Tracking Data

```typescript
interface TrackingData {
  tracking_data: {
    shipment_status: string;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_name: string;
      current_status: string;
      shipment_status: string;
      delivered_date: string | null;
      edd: string;
      scans: Array<{
        date: string;
        activity: string;
        location: string;
      }>;
    }>;
  };
}
```

---

## Security

### 1. Authentication

- All mutating endpoints require JWT authentication
- Tracking endpoints are public (require shipment ID/AWB)
- Token verified using same JWT_SECRET as main backend

### 2. Data Validation

- Required fields validated on backend
- Pincode format validation
- Weight/dimension constraints
- Phone number format validation

### 3. Rate Limiting

- Shiprocket token cached for 23 hours
- Prevents excessive authentication requests
- Automatic token refresh on expiry

---

## Performance Optimization

### 1. Token Caching

```javascript
let cachedToken = null;
let tokenExpiry = null;

async function getShiprocketToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  // Fetch new token
}
```

### 2. Async Operations

- Shipment creation doesn't block order completion
- Payment verified first, then shipment created
- Customer redirected immediately after payment

### 3. Error Recovery

- Failed shipment creation doesn't fail order
- Admin can retry shipment creation
- Customer order status updated independently

---

## Future Enhancements

1. **Multiple Courier Support**
   - Allow customer to choose courier
   - Compare delivery times and costs
   - Default to cheapest option

2. **COD Support**
   - Cash on delivery orders
   - COD charges calculation
   - COD remittance tracking

3. **Return/Exchange**
   - Initiate return shipments
   - Generate return labels
   - Track return status

4. **Webhook Integration**
   - Real-time status updates from Shiprocket
   - Automatic status sync
   - Email/SMS notifications

5. **Bulk Operations**
   - Bulk shipment creation
   - Bulk AWB assignment
   - Bulk pickup requests

6. **Analytics Dashboard**
   - Shipping cost trends
   - Delivery performance
   - Courier comparison
   - Regional analysis

---

## Troubleshooting

### Issue: Payment successful but no shipment created

**Solution:**
- Check payment-api logs
- Verify SHIPROCKET credentials
- Ensure pickup location exists
- Check API rate limits

### Issue: Tracking shows no data

**Solution:**
- Verify shipment ID is correct
- Check if AWB assigned
- Wait for courier to scan package
- Shiprocket updates may be delayed

### Issue: Authentication failed

**Solution:**
- Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
- Check Shiprocket account status
- Ensure API access is enabled

---

## Support & Documentation

- **Shiprocket API Docs:** https://apidocs.shiprocket.in/
- **Razorpay Docs:** https://razorpay.com/docs/
- **Internal API Docs:** `/API-Backend/payment-api/SHIPMENT_API_README.md`

---

## Changelog

### v1.0.0 - November 18, 2025

- Initial shipment integration
- Shiprocket API helper implementation
- 10 shipment API endpoints
- Frontend ShipmentService
- OrderTracking component
- Checkout integration with payment
- Complete order flow
- Documentation and testing guide

---

**Last Updated:** November 18, 2025  
**Status:** Production Ready ✅
