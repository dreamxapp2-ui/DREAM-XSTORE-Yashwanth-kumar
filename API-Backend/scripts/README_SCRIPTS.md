# Backend Scripts

This directory contains utility scripts for the Dream X Store backend.

---

## Available Scripts

### 1. seedSuperadmin.js

**Purpose:** Create the first superadmin user in the database (one-time setup)

**Usage:**
```bash
node seedSuperadmin.js
```

**What it does:**
- Connects to MongoDB
- Checks if superadmin already exists
- Creates superadmin with:
  - Email: `admin@dreamxstore.com`
  - Password: `AdminPass@123` (change in production!)
  - Role: `superadmin`
  - Verified: `true`
- Outputs credentials to console

**Important:**
- Run this **only once** on a fresh database
- Script checks if superadmin exists before creating
- If superadmin exists, script skips creation
- Change the hardcoded credentials in production!

**Output Example:**
```
Connecting to MongoDB...
✓ Connected to MongoDB
Hashing password...
✓ Superadmin created successfully!

═══════════════════════════════════════
SUPERADMIN CREDENTIALS
═══════════════════════════════════════
Email:    admin@dreamxstore.com
Password: AdminPass@123
═══════════════════════════════════════
```

**Environment Variables Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key (for token generation)

**Prerequisites:**
- MongoDB must be running
- `.env` file must exist in API-Backend directory
- Node.js and npm installed

**Error Cases:**
- If MongoDB not running: "connect ECONNREFUSED"
- If .env missing: "Cannot find module '../.env'"
- If superadmin exists: "Superadmin already exists. Skipping creation."

---

## Running Scripts

### From API-Backend directory:

```bash
# Navigate to API-Backend
cd API-Backend

# Run the seed script
node scripts/seedSuperadmin.js
```

### From project root:

```bash
# Navigate to backend scripts
cd API-Backend/scripts

# Run the seed script
node seedSuperadmin.js
```

---

## Future Scripts

This section is reserved for future scripts like:
- `seedProducts.js` - Seed sample products
- `seedUsers.js` - Create test users
- `resetDatabase.js` - Clear database
- `backupDatabase.js` - Backup MongoDB
- `migrateDatabase.js` - Run migrations

---

## Script Development Guidelines

When adding new scripts, follow these conventions:

1. **Naming:** Use camelCase, descriptive names (e.g., `seedProducts.js`)
2. **Documentation:** Include header comment with purpose and usage
3. **Error Handling:** Use try-catch, provide clear error messages
4. **Environment:** Load .env variables with `require('dotenv').config()`
5. **Exit Codes:** Use `process.exit(0)` for success, `process.exit(1)` for failure
6. **Console Output:** Use colors and clear formatting for readability
7. **Logging:** Include timestamps and progress indicators
8. **Validation:** Check prerequisites before running

---

## Common Issues

### Script not found
```
Error: Cannot find module
```
Make sure you're in the correct directory and using the correct filename.

### MongoDB connection failed
```
Error: connect ECONNREFUSED
```
Make sure MongoDB service is running on your machine.

### Superadmin already exists
```
⚠ Superadmin already exists. Skipping creation.
```
This is normal if you've already run the script. To re-run:
1. Delete the superadmin from MongoDB
2. Run the script again

Or use the admin panel to change the password instead.

---

## Support

For issues with scripts:
1. Check the error message carefully
2. Verify .env file has required variables
3. Make sure MongoDB is running
4. Check file permissions (should be readable)
5. See documentation in SUPERADMIN_SETUP.md for more details

---

**Last Updated:** 2024
