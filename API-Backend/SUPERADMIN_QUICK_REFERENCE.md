# Superadmin Quick Reference

## Quick Start (5 minutes)

### 1. Create First Superadmin

```bash
cd API-Backend
node scripts/seedSuperadmin.js
```

Output:
```
Email:    admin@dreamxstore.com
Password: AdminPass@123
```

### 2. Login as Superadmin

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dreamxstore.com",
    "password": "AdminPass@123"
  }'
```

Returns:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { "role": "superadmin", ... }
}
```

### 3. Use Token in Protected Routes

```bash
# Get all users (superadmin only)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer eyJhbGc..."

# Promote user to admin
curl -X PUT http://localhost:3000/api/admin/users/<userId>/role \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## Roles & Permissions

```
┌──────────┬──────────┬──────────────────────────────┐
│  Role    │ Can Login│ Can Do                       │
│          │ to Admin │                              │
├──────────┼──────────┼──────────────────────────────┤
│ user     │    ✗    │ Regular features only        │
│ admin    │    ✓    │ Admin operations             │
│ superadmin│    ✓   │ Everything (create admins)   │
└──────────┴──────────┴──────────────────────────────┘
```

---

## Middleware Usage

### Protect a route

```javascript
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Superadmin only
router.delete('/products/:id', auth, authorize('superadmin'), handler);

// Admin or superadmin
router.get('/stats', auth, authorize(['admin', 'superadmin']), handler);
```

### Order matters!

```javascript
// ✓ CORRECT
router.get('/admin', auth, authorize('superadmin'), handler);

// ✗ WRONG - auth must come first
router.get('/admin', authorize('superadmin'), auth, handler);
```

---

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | any | Admin login |
| GET | `/api/admin/users` | superadmin | List all users |
| PUT | `/api/admin/users/:id/role` | superadmin | Change user role |
| GET | `/api/admin/stats` | admin+ | Dashboard stats |

---

## Files Added/Modified

```
API-Backend/
├── models/User.js                    [MODIFIED] Added role field
├── controllers/
│   ├── auth.js                       [MODIFIED] Added role to JWT
│   └── admin.js                      [NEW] Admin operations
├── middleware/
│   ├── auth.js                       [MODIFIED] No changes needed
│   └── authorize.js                  [NEW] Role checking
├── routes/
│   ├── auth.js                       [NO CHANGE]
│   └── admin.js                      [NEW] Admin routes
├── scripts/
│   └── seedSuperadmin.js             [NEW] Create first superadmin
├── app.js                            [MODIFIED] Added admin routes
└── SUPERADMIN_SETUP.md               [NEW] Full documentation
```

---

## Common Tasks

### Create first superadmin
```bash
node scripts/seedSuperadmin.js
```

### Login and get token
```bash
POST /api/admin/login
```

### Promote user to admin
```bash
PUT /api/admin/users/<userId>/role
Body: {"role": "admin"}
```

### Get user statistics
```bash
GET /api/admin/stats
Header: Authorization: Bearer <token>
```

### Protect new routes
```javascript
router.post('/api/products', auth, authorize('superadmin'), createProduct);
```

---

## Important Notes

1. **Seed script** must be run ONCE to create superadmin
2. **Never commit** superadmin password to git
3. **JWT_SECRET** must be in `.env` file
4. **HTTPS** required in production
5. **Token expires** in 30 days - user must login again
6. **Regular users** cannot login to `/api/admin/login` (403 error)
7. **Auth before authorize** - middleware order matters!

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Seed script fails | Check MongoDB is running and `.env` has `MONGODB_URI` |
| 403 on admin route | Check JWT token is valid and user has correct role |
| 401 on admin route | Check Authorization header format: `Bearer <token>` |
| Superadmin exists error | Already created - user exists with that email |
| Token expired | User needs to login again |

---

See `SUPERADMIN_SETUP.md` for full details.
