# Shipment API - Quick Reference Card

## 🚀 Quick Start

### Start Services
```bash
# Start Payment API (Terminal 1)
cd API-Backend/payment-api
npm start  # Runs on :3001

# Start Frontend (Terminal 2)
cd Dreamxstore
npm run dev  # Runs on :3000
```

### Environment Setup
```env
# payment-api/.env
SHIPROCKET_EMAIL=your@email.com
SHIPROCKET_PASSWORD=your_password

# Dreamxstore/.env.local
NEXT_PUBLIC_PAY_API_URL=http://localhost:3001
```

---

## 📡 API Endpoints Cheat Sheet

### Public Endpoints (No Auth)
```bash
# Health check
GET /shipment/status

# Get delivery price
GET /shipment/delivery-price?pickup_postcode=400001&delivery_postcode=560001&weight=0.5&cod=false

# Track by shipment ID
GET /shipment/track/123456

# Track by AWB
GET /shipment/track-awb/ABCD1234567890
```

### Authenticated Endpoints (Requires JWT)
```bash
# Create shipment order
POST /shipment/create-order
Headers: Authorization: Bearer <token>
Body: { order_id, billing_*, order_items[], ... }

# Add pickup location
POST /shipment/add-pickup-location
Headers: Authorization: Bearer <token>
Body: { pickup_location, name, email, phone, address, ... }

# Assign AWB
POST /shipment/assign-awb
Body: { shipment_id, courier_id }

# Request pickup
POST /shipment/request-pickup
Body: { shipment_id, pickup_date? }

# Get all orders
GET /shipment/orders?page=1&per_page=20&status=DELIVERED

# Cancel shipment
POST /shipment/cancel
Body: { shipment_ids: [123, 456] }
```

---

## 💻 Frontend Code Snippets

### Import Service
```typescript
import ShipmentService from '@/src/lib/api/shipmentService';
```

### Get Delivery Price
```typescript
const price = await ShipmentService.getDeliveryPrice({
  pickup_postcode: 400001,
  delivery_postcode: 560001,
  weight: 0.5,
  cod: false,
});
console.log(price.delivery_cost); // ₹50
```

### Create Shipment
```typescript
const shipment = await ShipmentService.createShipmentOrder({
  order_id: 'ORD-123',
  order_date: '2025-11-18',
  pickup_location: 'Main Warehouse',
  billing_customer_name: 'John',
  billing_last_name: 'Doe',
  billing_address: '123 Street',
  billing_city: 'Mumbai',
  billing_state: 'Maharashtra',
  billing_country: 'India',
  billing_pincode: '400001',
  billing_email: 'john@example.com',
  billing_phone: '9999999999',
  shipping_is_billing: true,
  order_items: [{
    name: 'Product',
    sku: 'SKU-001',
    units: 1,
    selling_price: 500,
  }],
  payment_method: 'Prepaid',
  sub_total: 500,
  weight: 0.5,
  length: 30,
  breadth: 20,
  height: 10,
});
console.log(shipment.shipment_id);
```

### Track Shipment
```typescript
const tracking = await ShipmentService.trackByShipmentId(123456);
console.log(tracking.tracking_data.shipment_track[0].current_status);
```

### Use Tracking Component
```tsx
import OrderTracking from '@/src/components/orders/OrderTracking';

<OrderTracking shipmentId={123456} />
// OR
<OrderTracking awbCode="ABCD1234567890" />
```

---

## 🔧 Common Tasks

### Add First Pickup Location
```bash
curl -X POST http://localhost:3001/shipment/add-pickup-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickup_location": "Main Warehouse",
    "name": "Store Manager",
    "email": "manager@store.com",
    "phone": "9999999999",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "pin_code": "400001"
  }'
```

### Test Delivery Price
```bash
curl "http://localhost:3001/shipment/delivery-price?pickup_postcode=400001&delivery_postcode=560001&weight=0.5&cod=false"
```

### Get Token from Login
```javascript
// In browser console after login
const token = localStorage.getItem('token');
console.log(token);
```

---

## 🐛 Debugging

### Check Logs
```bash
# Payment API logs
# Look for [Shipment] prefix

# Frontend logs
# Look for [ShipmentService] prefix in browser console
```

### Common Issues

#### "No courier options available"
- Check if pincodes are serviceable
- Verify weight/dimensions are reasonable
- Try different postcode combinations

#### "Pickup location not found"
- Add pickup location first
- Ensure pickup_location name matches exactly
- Check Shiprocket dashboard

#### "Authentication failed"
- Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
- Check Shiprocket account is active
- Test credentials on Shiprocket dashboard

#### "Payment successful but shipment failed"
- Check payment-api logs
- Customer still charged - create shipment manually
- Use admin panel or API to create shipment

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* result data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Delivery Price Response
```json
{
  "success": true,
  "data": {
    "courier_name": "Delhivery Surface",
    "courier_company_id": 12,
    "estimated_delivery_days": 5,
    "estimated_delivery_date": "2025-11-23",
    "delivery_cost": 45.50,
    "cod_charges": 0,
    "all_options": [...]
  }
}
```

### Shipment Creation Response
```json
{
  "success": true,
  "data": {
    "order_id": 123456,
    "shipment_id": 789012,
    "status": "NEW",
    "status_code": 1
  }
}
```

### Tracking Response
```json
{
  "success": true,
  "data": {
    "tracking_data": {
      "shipment_track": [{
        "id": 789012,
        "awb_code": "ABCD1234567890",
        "courier_name": "Delhivery",
        "current_status": "In Transit",
        "delivered_date": null,
        "edd": "2025-11-23",
        "scans": [{
          "date": "2025-11-18 14:30:00",
          "activity": "Shipment picked up",
          "location": "Mumbai Hub"
        }]
      }]
    }
  }
}
```

---

## 🔐 Authentication

### Get Token (User Login)
```typescript
// After user login
const token = localStorage.getItem('token');
```

### Include in Request
```typescript
fetch('http://localhost:3001/shipment/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
});
```

### ShipmentService Auto-Handles Auth
```typescript
// Token automatically added from localStorage
await ShipmentService.createShipmentOrder(data);
```

---

## 📝 TypeScript Types

### Import Types
```typescript
import type {
  DeliveryPriceParams,
  DeliveryPrice,
  ShipmentOrderData,
  ShipmentOrderResponse,
  TrackingData,
} from '@/src/lib/api/shipmentService';
```

### Use in Component
```typescript
const [tracking, setTracking] = useState<TrackingData | null>(null);
const [deliveryPrice, setDeliveryPrice] = useState<DeliveryPrice | null>(null);
```

---

## 🎯 Integration Checklist

- [ ] Add SHIPROCKET_EMAIL to .env
- [ ] Add SHIPROCKET_PASSWORD to .env
- [ ] Add NEXT_PUBLIC_PAY_API_URL to .env.local
- [ ] Start payment-api service
- [ ] Add pickup location via API
- [ ] Test delivery price endpoint
- [ ] Test complete checkout flow
- [ ] Verify shipment creation
- [ ] Test order tracking
- [ ] Check error handling

---

## 📞 Quick Links

- **Shiprocket Dashboard:** https://app.shiprocket.in/
- **Shiprocket API Docs:** https://apidocs.shiprocket.in/
- **Internal Docs:** `/API-Backend/payment-api/SHIPMENT_API_README.md`
- **Integration Guide:** `/SHIPMENT_INTEGRATION_GUIDE.md`
- **Architecture:** `/SHIPMENT_ARCHITECTURE.md`

---

## ⚡ Performance Tips

- Token cached for 23 hours (no need to re-auth)
- Use delivery price endpoint before checkout
- Track by shipment ID (faster than AWB)
- Cache tracking data on frontend (5 min refresh)

---

## 🚨 Emergency Commands

### Check if API is running
```bash
curl http://localhost:3001/shipment/status
```

### View recent shipments
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/shipment/orders?per_page=10"
```

### Cancel shipment
```bash
curl -X POST http://localhost:3001/shipment/cancel \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipment_ids": [123456]}'
```

---

**Quick Reference v1.0** | Last Updated: November 18, 2025
