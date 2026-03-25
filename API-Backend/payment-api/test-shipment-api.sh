#!/bin/bash

# Shipment API Test Script
# This script tests all shipment API endpoints

BASE_URL="http://localhost:3001"
TOKEN="your-jwt-token-here"

echo "🚀 Shipment API Test Suite"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
curl -s -X GET "$BASE_URL/shipment/status" | jq '.'
echo ""
echo ""

# Test 2: Get Delivery Price (No Auth Required)
echo -e "${YELLOW}Test 2: Get Delivery Price${NC}"
curl -s -X GET "$BASE_URL/shipment/delivery-price?pickup_postcode=400001&delivery_postcode=560001&weight=0.5&cod=false" | jq '.'
echo ""
echo ""

# Test 3: Add Pickup Location (Requires Auth)
echo -e "${YELLOW}Test 3: Add Pickup Location${NC}"
echo "Skipped - Requires valid JWT token"
# curl -s -X POST "$BASE_URL/shipment/add-pickup-location" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{
#     "pickup_location": "Test Warehouse",
#     "name": "John Doe",
#     "email": "john@example.com",
#     "phone": "9999999999",
#     "address": "123 Main Street",
#     "city": "Mumbai",
#     "state": "Maharashtra",
#     "country": "India",
#     "pin_code": "400001"
#   }' | jq '.'
echo ""
echo ""

# Test 4: Create Shipment Order (Requires Auth)
echo -e "${YELLOW}Test 4: Create Shipment Order${NC}"
echo "Skipped - Requires valid JWT token and pickup location"
# curl -s -X POST "$BASE_URL/shipment/create-order" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{
#     "order_id": "TEST-ORD-001",
#     "order_date": "2025-11-18",
#     "pickup_location": "Test Warehouse",
#     "billing_customer_name": "Jane",
#     "billing_last_name": "Smith",
#     "billing_address": "456 Park Avenue",
#     "billing_city": "Bangalore",
#     "billing_state": "Karnataka",
#     "billing_country": "India",
#     "billing_pincode": "560001",
#     "billing_email": "jane@example.com",
#     "billing_phone": "8888888888",
#     "shipping_is_billing": true,
#     "order_items": [{
#       "name": "Test Product",
#       "sku": "TEST-001",
#       "units": 1,
#       "selling_price": 500
#     }],
#     "payment_method": "Prepaid",
#     "sub_total": 500,
#     "weight": 0.5,
#     "length": 25,
#     "breadth": 20,
#     "height": 5
#   }' | jq '.'
echo ""
echo ""

# Test 5: Track Shipment (No Auth Required - but needs valid shipment ID)
echo -e "${YELLOW}Test 5: Track Shipment${NC}"
echo "Skipped - Requires valid shipment ID"
# curl -s -X GET "$BASE_URL/shipment/track/123456" | jq '.'
echo ""
echo ""

echo -e "${GREEN}✅ Test Suite Completed${NC}"
echo ""
echo "Note: Some tests are skipped because they require:"
echo "  - Valid JWT authentication token"
echo "  - Registered pickup location"
echo "  - Valid shipment IDs"
echo ""
echo "To run authenticated tests:"
echo "  1. Set TOKEN variable with valid JWT"
echo "  2. Uncomment the curl commands"
echo "  3. Run: bash test-shipment-api.sh"
echo ""
