# Brand Login Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRAND LOGIN SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   FRONTEND (NEXT.JS) │
└──────────────────────┘
         │
         ├─ Page: /brand-login
         │  └─ Component: BrandLoginPage
         │     ├─ Form Fields:
         │     │  ├─ Brand Name (text)
         │     │  ├─ Owner Email (email)
         │     │  └─ Password (password)
         │     └─ Validation: Zod Schema
         │
         └─ Page: /brand/dashboard
            └─ Component: BrandDashboard
               ├─ Guard: Check localStorage
               ├─ Display: Brand Info
               └─ Actions: Logout

┌──────────────────────────────────┐
│   SERVICE LAYER (TYPESCRIPT)     │
└──────────────────────────────────┘
         │
         └─ BrandAuthService
            ├─ login(credentials)
            ├─ getCurrentBrand()
            ├─ isLoggedIn()
            ├─ logout()
            └─ getToken()

┌──────────────────────────────────┐
│   API CLIENT LAYER               │
└──────────────────────────────────┘
         │
         └─ apiClient.post()
            └─ Auto-attach token
            └─ Handle auth errors

┌──────────────────────────────────┐
│   BACKEND (EXPRESS.JS)           │
└──────────────────────────────────┘
         │
         ├─ Route: POST /api/admin/brand-login
         │  └─ Controller: adminController.brandLogin()
         │
         └─ Database Operations:
            └─ Query Brand collection
            └─ Verify password (bcrypt)
            └─ Generate JWT token

┌──────────────────────────────────┐
│   DATABASE (MONGODB)             │
└──────────────────────────────────┘
         │
         └─ Collection: brands
            ├─ brandName
            ├─ ownerEmail
            ├─ password (hashed)
            ├─ status
            ├─ profileImage
            └─ ... other fields
```

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              BRAND LOGIN AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

STEP 1: FORM SUBMISSION
┌────────────────────────────────────────┐
│ User enters:                            │
│ - Brand Name: "MyBrand"                │
│ - Owner Email: "owner@brand.com"      │
│ - Password: "securepass123"            │
│                                         │
│ Click "Sign In"                        │
└────────────────────────────────────────┘
         │
         ▼
STEP 2: CLIENT-SIDE VALIDATION
┌────────────────────────────────────────┐
│ Zod Schema validates:                   │
│ ✓ brandName not empty                  │
│ ✓ ownerEmail is valid email            │
│ ✓ password not empty                   │
│                                         │
│ If valid → proceed to API call          │
│ If invalid → show field errors          │
└────────────────────────────────────────┘
         │
         ▼
STEP 3: API REQUEST
┌────────────────────────────────────────┐
│ BrandAuthService.login(credentials)    │
│         │                               │
│         ▼                               │
│ POST /api/admin/brand-login             │
│ {                                       │
│   "brandName": "MyBrand",              │
│   "ownerEmail": "owner@brand.com",    │
│   "password": "securepass123"          │
│ }                                       │
└────────────────────────────────────────┘
         │
         ▼
STEP 4: BACKEND PROCESSING
┌────────────────────────────────────────┐
│ adminController.brandLogin():           │
│                                         │
│ 1. Validate input fields                │
│ 2. Query DB:                            │
│    db.brands.findOne({                  │
│      brandName: "MyBrand",             │
│      ownerEmail: "owner@brand.com"    │
│    })                                   │
│ 3. Check if brand found                 │
│ 4. Check if status === 'Active'        │
│ 5. Compare password:                    │
│    bcrypt.compare(input, hashed)       │
│ 6. Generate JWT token                   │
│ 7. Return success response              │
└────────────────────────────────────────┘
         │
         ▼
STEP 5: RESPONSE HANDLING
┌────────────────────────────────────────┐
│ Success (200):                          │
│ {                                       │
│   "success": true,                     │
│   "token": "eyJhbGc...",              │
│   "brand": {                           │
│     "id": "507f...",                   │
│     "brandName": "MyBrand",           │
│     "ownerEmail": "owner@brand.com", │
│     "status": "Active"                │
│   }                                     │
│ }                                       │
│                                         │
│ Error (401):                            │
│ {                                       │
│   "success": false,                    │
│   "message": "Invalid credentials"    │
│ }                                       │
└────────────────────────────────────────┘
         │
         ▼
STEP 6: DATA STORAGE
┌────────────────────────────────────────┐
│ localStorage.setItem('token', token)   │
│ localStorage.setItem(                  │
│   'brand_user',                        │
│   JSON.stringify(brand)               │
│ )                                       │
└────────────────────────────────────────┘
         │
         ▼
STEP 7: REDIRECT
┌────────────────────────────────────────┐
│ router.push('/brand/dashboard')         │
│                                         │
│ → Loads BrandDashboard component       │
│ → Verifies token exists                │
│ → Displays brand information           │
└────────────────────────────────────────┘
```

## 📊 Data Structure Flow

```
┌─────────────────────────────────────┐
│     FORM INPUT (Frontend)            │
├─────────────────────────────────────┤
│ {                                    │
│   "brandName": "MyBrand",           │
│   "ownerEmail": "owner@brand.com", │
│   "password": "securepass123"       │
│ }                                    │
└─────────────────────────────────────┘
         │ (POST request)
         ▼
┌─────────────────────────────────────┐
│   BACKEND PROCESSING                │
├─────────────────────────────────────┤
│ Receives → Validates → Queries DB   │
│ Compares password → Generates token │
└─────────────────────────────────────┘
         │ (Response)
         ▼
┌─────────────────────────────────────┐
│   API RESPONSE (Success)             │
├─────────────────────────────────────┤
│ {                                    │
│   "success": true,                  │
│   "message": "...",                │
│   "token": "eyJhbGc...",          │
│   "brand": {                        │
│     "id": "507f...",               │
│     "brandName": "MyBrand",        │
│     "ownerEmail": "...",           │
│     "status": "Active",            │
│     "profileImage": { ... }        │
│   }                                 │
│ }                                    │
└─────────────────────────────────────┘
         │ (Store locally)
         ▼
┌─────────────────────────────────────┐
│   LOCALSTORAGE (Frontend)            │
├─────────────────────────────────────┤
│ localStorage.token                   │
│   = "eyJhbGc..."                    │
│                                      │
│ localStorage.brand_user              │
│   = {                                │
│     "id": "507f...",                │
│     "brandName": "MyBrand",         │
│     "ownerEmail": "...",            │
│     "status": "Active",             │
│     "profileImage": { ... },        │
│     "token": "eyJhbGc..."           │
│   }                                  │
└─────────────────────────────────────┘
         │ (Use in requests)
         ▼
┌─────────────────────────────────────┐
│   SUBSEQUENT REQUESTS                │
├─────────────────────────────────────┤
│ GET /api/brand/profile               │
│ Authorization: Bearer <token>        │
│                                      │
│ All requests automatically include   │
│ the token via TokenManager           │
└─────────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────┐
│      PASSWORD SECURITY               │
├─────────────────────────────────────┤
│                                      │
│ 1. CREATION (Admin Creates Brand)   │
│    Input: plaintext password         │
│           │                          │
│           ▼                          │
│    bcrypt.hash(password, 10)        │
│           │                          │
│           ▼                          │
│    $2a$10$... (hashed)              │
│           │                          │
│           ▼                          │
│    Store in DB                      │
│                                      │
│ 2. LOGIN (Brand Signs In)           │
│    Input: plaintext password         │
│           │                          │
│           ▼                          │
│    bcrypt.compare(input, hashed)   │
│           │                          │
│           ├─ Match → Generate token │
│           └─ No match → Error 401   │
│                                      │
│ 3. TOKEN USAGE                      │
│    Stored: localStorage.token       │
│    Sent: Authorization header       │
│    Auto-attached: TokenManager      │
│    Expiry: 30 days                 │
│                                      │
└─────────────────────────────────────┘
```

## 🗄️ Database Schema (Brand Collection)

```
db.brands
├── _id: ObjectId
├── brandName: String (required, indexed)
├── ownerEmail: String (required, unique, indexed)
├── password: String (required, bcrypt hashed)
├── status: String (enum: Active/Pending/Suspended/Rejected)
├── profileImage: { url, publicId }
├── description: String
├── followerCount: Number
├── socialLinks: { instagram, facebook, twitter }
├── pickupLocation: String (required)
├── pincode: String (required)
├── phone: String (required)
├── address: String (required)
├── city: String (required)
├── state: String (required)
├── country: String (required)
├── isVerified: Boolean
├── productCount: Number
├── commissionRate: Number
├── createdBy: ObjectId (ref: User)
├── createdAt: Date
└── updatedAt: Date
```

## 🎯 Component Relationships

```
App Router
├── /brand-login
│   └── page.tsx
│       └── BrandLoginPage.tsx
│           ├── Form (3 fields)
│           ├── BrandAuthService.login()
│           └── router.push('/brand/dashboard')
│
└── /brand/dashboard
    └── page.tsx
        └── BrandDashboard.tsx
            ├── BrandAuthService.getCurrentBrand()
            ├── Redirect if not logged in
            ├── Display brand info
            └── Logout button
                └── BrandAuthService.logout()
```

This architecture ensures:
✅ Clear separation of concerns
✅ Secure authentication flow
✅ Persistent sessions
✅ Type-safe operations
✅ Scalable service layer
