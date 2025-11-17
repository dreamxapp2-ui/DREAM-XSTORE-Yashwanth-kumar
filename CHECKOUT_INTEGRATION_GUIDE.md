# Complete Checkout Integration Guide - Shiprocket + Razorpay

## 📋 Overview

The checkout process integrates three core systems:
1. **Razorpay** - Payment processing
2. **Shiprocket** - Shipping/logistics management
3. **Toast Notifications** - Real-time user feedback

## 🏗️ System Architecture

```
Frontend (Next.js)
    ↓
Checkout Process
    ├─ Validate billing details
    ├─ Create Razorpay order
    ↓
Backend Payment API (Express)
    ├─ Generate order ID via Razorpay
    ├─ Store order in MongoDB
    ↓
Payment Gateway (Razorpay)
    ├─ User completes payment
    ├─ Return payment signature
    ↓
Backend Verification
    ├─ Verify payment signature
    ├─ Create Shiprocket order
    ├─ Request pickup
    ↓
Shiprocket
    ├─ Create shipment
    ├─ Generate AWB number
    ├─ Schedule pickup
    ↓
User
    ├─ Success notification
    ├─ Clear cart
    └─ Redirect to home
```

## 🔧 Frontend Configuration

### Environment Variables (.env.local)

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_gZaMQT84FVZ7r9

# Payment API URL
NEXT_PUBLIC_PAY_API_URL=http://localhost:3004

# Main API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
```

### Required Dependencies

```json
{
  "axios": "^1.10.0",
  "framer-motion": "^12.23.24"
}
```

## 🛒 Checkout Flow

### 1. Cart Page Component
**File**: `src/screens/CartPage/CartPage.tsx`

**Key Features**:
- Calculate order totals (subtotal, shipping, tax)
- Collect billing details
- Validate all required fields
- Handle Shiprocket delivery pricing

### 2. Billing Details Form
**Required Fields**:
- `billing_customer_name` - Full name
- `billing_address` - Street address
- `billing_city` - City
- `billing_pincode` - Postal code
- `billing_state` - State
- `billing_country` - Country
- `billing_email` - Email address
- `billing_phone` - 10-digit phone number

### 3. Checkout Handler Flow

```
handleCheckout()
    ├─ Validate billing details
    │   └─ Toast: warning if incomplete
    ├─ Verify authentication
    │   └─ Toast: warning if not logged in
    ├─ Validate cart items
    │   └─ Toast: error if invalid items
    ├─ Load Razorpay script
    ├─ Call backend /getorderid
    │   ├─ Backend creates Order document
    │   ├─ Backend calls Razorpay API
    │   └─ Returns order ID
    ├─ Open Razorpay payment modal
    │   └─ Toast: info with instructions
    ├─ User completes payment
    ├─ Call backend /verifypayment
    │   ├─ Verify payment signature
    │   ├─ Update order status to "confirmed"
    │   ├─ Create Shiprocket shipment
    │   ├─ Generate AWB number
    │   └─ Request pickup
    ├─ Clear cart from localStorage
    └─ Redirect to home
```

## 🔐 Backend Integration

### Payment API Routes
**Base URL**: `http://localhost:3004`

#### POST `/getorderid`
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "address": "123 Main St, New York, NY 10001",
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Product Name",
      "category": "Clothing",
      "size": "M",
      "price": 1000,
      "quantity": 2,
      "image": "https://..."
    }
  ],
  "totals": {
    "subtotal": 2000,
    "tax": 0,
    "shipping": 100,
    "total": 2100
  },
  "billing_customer_name": "John Doe",
  "billing_address": "123 Main St",
  "billing_city": "New York",
  "billing_pincode": "10001",
  "billing_state": "NY",
  "billing_country": "USA",
  "billing_email": "john@example.com",
  "billing_phone": "9876543210",
  "pickup_location": "Home"
}
```

**Response**:
```json
{
  "orderid": {
    "id": "order_1A2B3C4D5E6F7G8H"
  },
  "order_id": "507f191e810c19729de860ea"
}
```

#### POST `/verifypayment`
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "razorpay_payment_id": "pay_1A2B3C4D5E6F7G8H",
  "razorpay_order_id": "order_1A2B3C4D5E6F7G8H",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "id": "507f191e810c19729de860ea",
  "email": "john@example.com"
}
```

**Process**:
1. Verify Razorpay signature
2. Update order status to "confirmed"
3. Authenticate with Shiprocket
4. Create shipment order
5. Get AWB number
6. Request pickup
7. Send confirmation email

## 📦 Shiprocket Integration

### Authentication
**Credentials** (from `.env` backend):
```env
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
```

### Order Creation
The backend automatically:
1. Authenticates with Shiprocket API
2. Creates order with shipping address
3. Generates AWB (Air Way Bill) number
4. Requests pickup from location

**Shiprocket Order Format**:
```json
{
  "order_id": "razorpay_order_id",
  "order_date": "2024-01-15",
  "pickup_location": "Home",
  "billing_customer_name": "John Doe",
  "billing_address": "123 Main St",
  "billing_city": "New York",
  "billing_pincode": "10001",
  "billing_state": "NY",
  "billing_country": "USA",
  "billing_email": "john@example.com",
  "billing_phone": "9876543210",
  "shipping_is_billing": true,
  "order_items": [
    {
      "name": "Product Name",
      "sku": "Product Name",
      "units": 2,
      "selling_price": 1000
    }
  ],
  "payment_method": "Prepaid",
  "sub_total": 2000,
  "weight": 0.5,
  "length": 60,
  "breadth": 30,
  "height": 5
}
```

## 🔔 Toast Notifications

### Implemented Notifications

| Stage | Toast Type | Message | Duration |
|-------|-----------|---------|----------|
| Validation | warning | "Please fill all billing details." | 4s |
| Auth Error | warning | "Please log in to continue checkout" | 4s |
| Processing | info | "Processing your payment..." | No auto-dismiss |
| Invalid Items | error | "Invalid cart items found" | 4s |
| Order Creation | error | "Payment order creation failed" | 4s |
| Payment Modal | info | "Razorpay payment window opened..." | 5s |
| Verification | info | "Verifying payment..." | No auto-dismiss |
| Success | success | "Payment verified successfully!..." | 4s |
| Verification Error | error | "Payment verification failed" | 4s |
| Payment Error | error | "Failed to initiate payment..." | 4s |

### Toast Features
- **Spring Animation**: Smooth pop-out effect
- **Progress Bar**: Visual time indicator
- **Auto-dismiss**: Configurable duration
- **Action Buttons**: Optional click actions
- **Color-coded**: Type-specific colors

## ✅ Testing Checklist

- [ ] Frontend environment variables set correctly
- [ ] Backend environment variables configured
- [ ] Razorpay account and API keys valid
- [ ] Shiprocket credentials valid
- [ ] MongoDB connection working
- [ ] Payment API server running on port 3004
- [ ] All toast notifications display correctly
- [ ] Billing form validation works
- [ ] Cart items validation works
- [ ] Razorpay payment modal opens
- [ ] Payment verification succeeds
- [ ] Shiprocket order created successfully
- [ ] Cart clears after payment
- [ ] User redirected to home

## 🐛 Debugging

### Common Issues

**Issue**: Payment order ID not returned
- Check backend is running on port 3004
- Verify Razorpay API credentials
- Check MongoDB connection

**Issue**: Shiprocket order not created
- Verify Shiprocket credentials in backend .env
- Check billing address format
- Ensure pincode is valid for service area

**Issue**: Payment verification fails
- Check signature verification logic
- Verify order exists in database
- Check authorization header format

**Issue**: Toast notifications not showing
- Verify ToastProvider wraps root layout
- Check ToastDisplay component mounted
- Verify useToast hook imported correctly

## 📱 Mobile Responsiveness

The checkout flow is fully responsive:
- Mobile-friendly form inputs
- Touch-optimized buttons
- Full-width toast notifications
- Responsive grid layouts

## 🔒 Security Features

- JWT token validation
- Payment signature verification
- Secure authorization headers
- Password-protected Shiprocket API
- Environment variable protection
- Input validation and sanitization

## 📞 Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify all environment variables set
3. Test API endpoints with Postman
4. Check Razorpay and Shiprocket dashboards
5. Review backend server logs

---

**Last Updated**: December 2024
**Status**: ✅ Production Ready
