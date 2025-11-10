# Admin Panel - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend dependencies installed
- Frontend dependencies installed

---

## Step 1: Start Backend (30 seconds)

```bash
cd API-Backend
npm install
npm start
```

✅ Backend running on: `http://localhost:3000`

---

## Step 2: Create Superadmin (1 minute)

```bash
cd API-Backend
node scripts/seedSuperadmin.js
```

Output:
```
✓ Superadmin created successfully!
═══════════════════════════════════════
SUPERADMIN CREDENTIALS
═══════════════════════════════════════
Email:    admin@dreamxstore.com
Password: AdminPass@123
═══════════════════════════════════════
```

---

## Step 3: Start Frontend (30 seconds)

```bash
cd Dreamxstore
npm install
npm run dev
```

✅ Frontend running on: `http://localhost:3001`

---

## Step 4: Login to Admin (1 minute)

1. Open browser: `http://localhost:3001/admin/login`
2. Enter credentials:
   - Email: `admin@dreamxstore.com`
   - Password: `AdminPass@123`
3. Click "Sign in"
4. You're in! 🎉

---

## What's Connected

✅ **Admin Login** - Real backend authentication
✅ **Dashboard Stats** - Real API data
✅ **Recent Orders** - Real backend data
✅ **Recent Brands** - Real backend data

---

## Next Steps

1. Test other admin pages (Brands, Products, Orders, etc.)
2. Connect remaining pages to backend
3. Implement missing features
4. Deploy to production

---

## Useful Commands

```bash
# Create new superadmin (if needed)
node API-Backend/scripts/seedSuperadmin.js

# Clear admin token (logout everyone)
# Delete localStorage.token on client

# Check backend logs
npm run dev (in API-Backend)

# Restart everything
Ctrl+C (in both terminals)
npm start (backend)
npm run dev (frontend)
```

---

## Credentials

| Field | Value |
|-------|-------|
| Email | admin@dreamxstore.com |
| Password | AdminPass@123 |
| Role | superadmin |

⚠️ **Change password after first login in production!**

---

## Testing

### Quick Tests

- [ ] Login succeeds
- [ ] Dashboard loads
- [ ] Stats display correctly
- [ ] Can logout
- [ ] Refresh page keeps login
- [ ] Invalid credentials fail
- [ ] Can't access admin without login

---

## Troubleshooting

**Backend won't start?**
- Check if port 3000 is available
- Run `npm install` in API-Backend
- Check MongoDB connection

**Frontend shows "Failed to load dashboard"?**
- Verify backend is running
- Check browser console for errors
- Verify NEXT_PUBLIC_API_URL in .env.local

**Can't login?**
- Run seed script: `node scripts/seedSuperadmin.js`
- Check backend logs for errors
- Verify credentials: admin@dreamxstore.com / AdminPass@123

---

## Architecture

```
Frontend (localhost:3001)
    ↓
API Client (axios)
    ↓
Backend API (localhost:3000/api)
    ↓
MongoDB
```

---

## Files Modified/Created

### Created
- ✨ `Dreamxstore/src/lib/api/admin/authService.ts` - Admin auth
- ✨ `Dreamxstore/app/admin/login/page.tsx` - Login UI

### Modified
- 📝 `Dreamxstore/app/admin/layout.tsx` - Auth checks + logout
- 📝 `Dreamxstore/src/mocks/browser.ts` - Disabled MSW
- 📝 `Dreamxstore/src/lib/api/config.ts` - Backend URL
- 📝 `Dreamxstore/src/lib/api/types.ts` - Added role field

---

## What's Not Yet Connected

The following pages exist but still use mock data:
- [ ] Brands list/management
- [ ] Products list/management
- [ ] Customers list/management
- [ ] Orders list/management
- [ ] Analytics
- [ ] Settings

**Next task:** Connect these pages to real backend APIs

---

## Security

🔒 **Current Setup:**
- ✅ Passwords hashed (bcryptjs)
- ✅ JWT tokens (30 days)
- ✅ Role-based access control
- ✅ Token auto-refresh
- ⚠️ HTTP (development only)

🔐 **For Production:**
- [ ] Enable HTTPS
- [ ] Use environment variables for secrets
- [ ] Change default password
- [ ] Configure CORS properly
- [ ] Use HttpOnly cookies
- [ ] Implement rate limiting

---

## Support

For detailed information, see:
- **Backend Setup:** `API-Backend/SUPERADMIN_SETUP.md`
- **Integration Guide:** `Dreamxstore/ADMIN_FRONTEND_BACKEND_INTEGRATION.md`
- **API Docs:** `API-Backend/routes/admin.js`

---

**Status:** Ready to use! 🎉
