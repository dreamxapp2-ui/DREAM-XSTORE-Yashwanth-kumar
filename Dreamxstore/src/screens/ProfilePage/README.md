# Profile Page - Refactored Structure

## 📁 Directory Structure

```
ProfilePage/
├── sections/
│   ├── ProfileHeader.tsx          # User avatar, stats, edit/logout buttons
│   ├── ProfileOverview.tsx        # Basic account information display
│   ├── OrdersTab.tsx              # Order history with status tracking
│   ├── WishlistTab.tsx            # Saved products grid
│   ├── AddressManagement.tsx      # Shipping/billing addresses
│   ├── PaymentMethods.tsx         # Saved cards & payment methods
│   ├── SecuritySettings.tsx       # Password, email, 2FA settings
│   ├── NotificationPreferences.tsx # Email & notification toggles
│   └── index.ts                   # Barrel export
├── ProfilePageRefactored.tsx      # ✅ Main component (ACTIVE)
├── ProfilePageNew.tsx             # Old monolithic version
├── ProfilePage.tsx                # Original simple version
└── README.md                      # This file
```

## 🎯 Active File
**`ProfilePageRefactored.tsx`** is the current active profile page being used in the app.

## 📦 Section Components

### 1. **ProfileHeader** (`sections/ProfileHeader.tsx`)
**Props:**
- `user`: UserProfile object
- `stats`: Account statistics (orders, wishlist, spent, etc.)
- `onEditProfile`: Callback for edit button
- `onLogout`: Callback for logout button

**Features:**
- Avatar with fallback to initials
- Brand account badge
- Stats grid (4 columns)
- Edit Profile & Logout buttons

---

### 2. **ProfileOverview** (`sections/ProfileOverview.tsx`)
**Props:**
- `user`: UserProfile object

**Features:**
- Displays username, email, phone
- Shows account type

---

### 3. **OrdersTab** (`sections/OrdersTab.tsx`)
**Props:**
- `orders`: Array of Order objects

**Features:**
- Order history list
- Status badges (Processing, Shipped, Delivered, Canceled)
- Action buttons (View Details, Track Order, Leave Review)
- Empty state with "Start Shopping" CTA

---

### 4. **WishlistTab** (`sections/WishlistTab.tsx`)
**Props:**
- `wishlist`: Array of WishlistItem objects

**Features:**
- Product grid layout
- Add to Cart & Remove buttons
- Stock status display
- Empty state with "Browse Products" CTA

---

### 5. **AddressManagement** (`sections/AddressManagement.tsx`)
**Props:**
- `addresses`: Array of Address objects

**Features:**
- List of saved addresses
- Shipping/Billing type badges
- Default address indicator
- Add, Edit, Delete actions

---

### 6. **PaymentMethods** (`sections/PaymentMethods.tsx`)
**Props:**
- `paymentMethods`: Array of PaymentMethod objects

**Features:**
- Saved cards list (last 4 digits only)
- Card brand & expiry display
- Default payment indicator
- Add, Delete, Set Default actions

---

### 7. **SecuritySettings** (`sections/SecuritySettings.tsx`)
**Props:**
- `twoFactorEnabled`: boolean
- `onToggle2FA`: Callback for 2FA toggle

**Features:**
- Change Password button
- Change Email button
- Two-Factor Authentication toggle

---

### 8. **NotificationPreferences** (`sections/NotificationPreferences.tsx`)
**Props:**
- `emailNotifications`: boolean
- `orderUpdates`: boolean
- `promotionalEmails`: boolean
- `onToggleEmail`: Callback
- `onToggleOrders`: Callback
- `onTogglePromotional`: Callback

**Features:**
- Custom toggle switches
- Email notifications control
- Order updates control
- Promotional emails control

---

## 🎨 Design Consistency

All sections follow the same design system:
- **Colors**: Brand blue (#004d84), Brand yellow (#f1ff8c)
- **Borders**: Sharp corners (rounded-[1px])
- **Buttons**: Pill shape (rounded-[30px])
- **Cards**: White with border-gray-200
- **Typography**: Responsive font sizes
- **Spacing**: Consistent padding system

## 🚀 Usage

### Importing Sections
```tsx
import {
  ProfileHeader,
  ProfileOverview,
  OrdersTab,
  WishlistTab,
  AddressManagement,
  PaymentMethods,
  SecuritySettings,
  NotificationPreferences
} from './sections';
```

### Using in Main Component
```tsx
<ProfileHeader 
  user={user}
  stats={stats}
  onEditProfile={() => setIsEditModalOpen(true)}
  onLogout={handleLogout}
/>

{activeTab === 'profile' && <ProfileOverview user={user} />}
{activeTab === 'orders' && <OrdersTab orders={orders} />}
{activeTab === 'wishlist' && <WishlistTab wishlist={wishlist} />}
{activeTab === 'settings' && (
  <>
    <AddressManagement addresses={addresses} />
    <PaymentMethods paymentMethods={paymentMethods} />
    <SecuritySettings 
      twoFactorEnabled={twoFactorEnabled}
      onToggle2FA={() => setTwoFactorEnabled(!twoFactorEnabled)}
    />
    <NotificationPreferences {...notificationProps} />
  </>
)}
```

## 🔄 State Management

All data is currently managed with `useState` in the main component:
- `user` - User profile data
- `addresses` - Address list
- `paymentMethods` - Payment cards
- `orders` - Order history
- `wishlist` - Wishlist items
- `stats` - Account statistics
- Notification toggles

**Next Step**: Connect to backend APIs

## ✅ Benefits of This Structure

1. **Modularity**: Each section is independent and reusable
2. **Maintainability**: Easy to find and fix bugs
3. **Testability**: Can test each component in isolation
4. **Scalability**: Easy to add new sections or modify existing ones
5. **Code Clarity**: Smaller files, focused responsibilities
6. **Team Collaboration**: Multiple developers can work on different sections

## 📝 Notes

- **Footer Removed**: Profile page no longer includes the footer component
- **Mock Data**: All data is currently mocked - needs API integration
- **Responsive**: All sections are fully responsive
- **Type Safe**: Full TypeScript type coverage

## 🔧 Future Enhancements

- [ ] Add modal components for Add/Edit Address
- [ ] Add modal for Add Payment Method
- [ ] Implement Change Password modal
- [ ] Implement Change Email modal
- [ ] Add 2FA setup flow
- [ ] Connect to backend APIs
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
