#!/bin/bash
# Test Script for Admin Endpoints
# 
# Usage: bash test-admin-endpoints.sh
# This script tests all admin endpoints in sequence

API_URL="http://localhost:3000/api"
ADMIN_EMAIL="admin@dreamxstore.com"
ADMIN_PASSWORD="AdminPass@123"

echo "==============================================="
echo "Testing Admin Endpoints"
echo "==============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Admin Login
echo -e "${YELLOW}1. Testing Admin Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Failed to get token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got token: ${TOKEN:0:20}...${NC}"
echo ""

# 2. Get Dashboard Stats (Admin+)
echo -e "${YELLOW}2. Testing Get Dashboard Stats${NC}"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/admin/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $STATS_RESPONSE"
echo ""

# 3. Get All Users (Superadmin only)
echo -e "${YELLOW}3. Testing Get All Users${NC}"
USERS_RESPONSE=$(curl -s -X GET "$API_URL/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $USERS_RESPONSE"
echo ""

# 4. Test with invalid token (should fail)
echo -e "${YELLOW}4. Testing with Invalid Token (should fail)${NC}"
INVALID_RESPONSE=$(curl -s -X GET "$API_URL/admin/users" \
  -H "Authorization: Bearer invalid.token.here")

echo "Response: $INVALID_RESPONSE"
echo ""

# 5. Test without token (should fail)
echo -e "${YELLOW}5. Testing without Token (should fail)${NC}"
NO_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/admin/users")

echo "Response: $NO_TOKEN_RESPONSE"
echo ""

echo "==============================================="
echo -e "${GREEN}Tests completed!${NC}"
echo "==============================================="
echo ""
echo "Notes:"
echo "- If login failed, check credentials in .env"
echo "- If stats/users failed, check token validity"
echo "- Invalid/missing token should return 401 error"
echo ""
