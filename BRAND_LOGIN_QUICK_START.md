# Brand Login - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:3000` (Next.js)
- MongoDB with at least one active brand

### Step 1: Create a Test Brand (if needed)

**Option A: Using MongoDB Shell**
```javascript
db.brands.insertOne({
  brandName: "TestBrand",
  ownerEmail: "test@brand.com",
  password: "$2a$10$...", // bcrypt hashed password
  pickupLocation: "Test Location",
  pincode: "123456",
  phone: "9876543210",
  address: "Test Address",
  city: "Test City",
  state: "Test State",
  country: "India",
  status: "Active",
  isVerified: true,
  followerCount: 0,
  description: "Test brand",
  createdAt: new Date()
})
```

**Option B: Hash Password First**
```bash
# Use Node.js to hash password
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('testpassword', 10).then(hash => console.log(hash));
"
# Output: $2a$10$... (use this in the db insert)
```

**Option C: Use Admin Panel**
- Go to `/admin/login`
- Navigate to Brand Accounts
- Click "Add Brand Account"
- Fill in details and create

### Step 2: Access Brand Login Page
```
http://localhost:3000/brand-login
```

### Step 3: Enter Credentials
- **Brand Name:** TestBrand
- **Owner Email:** test@brand.com
- **Password:** testpassword (or your password)

### Step 4: Verify Redirect
- Should redirect to: `http://localhost:3000/brand/dashboard`
- Should see brand name and status

---

## 🧪 Testing API Directly

### Using cURL
```bash
curl -X POST http://localhost:3000/api/admin/brand-login \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "TestBrand",
    "ownerEmail": "test@brand.com",
    "password": "testpassword"
  }'
```

### Using Postman
1. New POST request to `http://localhost:3000/api/admin/brand-login`
2. Body (raw JSON):
```json
{
  "brandName": "TestBrand",
  "ownerEmail": "test@brand.com",
  "password": "testpassword"
}
```
3. Send

---

## 📁 Files Created/Modified

### New Files
```
✅ Dreamxstore/app/brand-login/page.tsx
✅ Dreamxstore/app/brand/dashboard/page.tsx
✅ Dreamxstore/src/screens/BrandLoginPage/BrandLoginPage.tsx
✅ Dreamxstore/src/lib/api/brand/brandAuthService.ts
✅ BRAND_LOGIN_IMPLEMENTATION.md
✅ BRAND_LOGIN_TEST_GUIDE.sh
```

### Modified Files
```
✏️ API-Backend/controllers/admin.js (added brandLogin method)
✏️ API-Backend/routes/admin.js (added /brand-login route)
```

---

## 🔑 Key Endpoints

### Brand Login
```
POST /api/admin/brand-login
No authentication required
```

### Brand Dashboard
```
GET /brand/dashboard
Requires brand authentication
```

---

## 💾 LocalStorage Data After Login

After successful login, browser stores:

```javascript
// Token
localStorage.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Brand User Data
localStorage.brand_user = {
  "id": "507f1f77bcf86cd799439011",
  "brandName": "TestBrand",
  "ownerEmail": "test@brand.com",
  "status": "Active",
  "profileImage": null,
  "token": "eyJhbGc..."
}
```

---

## ❌ Common Issues & Solutions

### Issue: "Invalid brand name, email, or password"
**Solution:** 
- Verify brand exists with exact name and email
- Check password is correct
- Ensure status is "Active" (not Pending/Suspended/Rejected)

### Issue: "Brand account is pending"
**Solution:** 
- Brand status must be "Active"
- Use admin panel to change brand status
- Contact admin if pending

### Issue: Login page doesn't redirect
**Solution:**
- Check browser console for errors
- Verify token is in localStorage
- Check network tab for API response

### Issue: Dashboard shows blank/undefined
**Solution:**
- Make sure localStorage.brand_user exists
- Verify brand data structure in response
- Check browser console for JS errors

---

## 🔐 Security Checklist

✅ Passwords are bcrypt hashed in database
✅ JWT tokens expire in 30 days
✅ Brand data is separate from regular users
✅ Only Active brands can log in
✅ Password never returned in API response
✅ Token stored securely in localStorage
✅ Dashboard redirects if not authenticated

---

## 📞 Support

### For Questions About:
- **Backend API:** Check `API-Backend/controllers/admin.js`
- **Frontend Service:** Check `src/lib/api/brand/brandAuthService.ts`
- **Login Component:** Check `src/screens/BrandLoginPage/BrandLoginPage.tsx`
- **Database Schema:** Check `API-Backend/models/Brand.js`

---

## 🎯 Next Steps

1. ✅ Create test brand account
2. ✅ Test login with credentials
3. ✅ Verify redirect to dashboard
4. ✅ Test logout functionality
5. ⭐ Implement forgot password (if needed)
6. ⭐ Build brand profile editing
7. ⭐ Add product upload feature
8. ⭐ Create order management dashboard

---

## 📚 Full Documentation

For complete implementation details, see: `BRAND_LOGIN_IMPLEMENTATION.md`
For testing guide, see: `BRAND_LOGIN_TEST_GUIDE.sh`
