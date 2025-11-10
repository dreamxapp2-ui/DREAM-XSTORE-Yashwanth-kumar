# Admin UI - DreamXStore

A comprehensive, modern admin panel built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Pages
- ✅ **Dashboard** - Overview with stats, recent orders, and brands
- ✅ **Brand Management** - Approve, reject, and manage brands
- ✅ **Product Management** - Review products, toggle featured status
- ✅ **Order Management** - Track orders, update status, manage fulfillment
- ✅ **Customer Management** - View customers, ban/unban users
- ✅ **Analytics** - Performance metrics and insights
- ✅ **Settings** - Configure platform settings

### UI Components
- ✅ Responsive sidebar navigation
- ✅ Data tables with pagination
- ✅ Search and filter functionality
- ✅ Status badges
- ✅ Action buttons
- ✅ Mobile-responsive design

### Design
- Modern, clean interface
- Purple-blue gradient theme
- Smooth animations and transitions
- Card-based layout
- Consistent spacing and typography

## 📂 File Structure

```
app/admin/
├── layout.tsx                 # Admin layout with sidebar
├── page.tsx                   # Dashboard
├── brands/
│   └── page.tsx              # Brand management
├── products/
│   └── page.tsx              # Product management
├── orders/
│   └── page.tsx              # Order management
├── customers/
│   └── page.tsx              # Customer management
├── analytics/
│   └── page.tsx              # Analytics dashboard
└── settings/
    └── page.tsx              # Platform settings

src/components/ui/
├── table.tsx                  # Data table components
├── input.tsx                  # Input field
├── select.tsx                 # Select dropdown
├── button.tsx                 # Button component
├── card.tsx                   # Card component
├── badge.tsx                  # Status badge
└── ...
```

## 🎨 Pages Overview

### Dashboard (`/admin`)
- **Stats Cards**: Revenue, Orders, Brands, Users with trend indicators
- **Recent Orders**: Latest 5 orders with status
- **Recent Brands**: Latest 5 brand registrations

### Brands (`/admin/brands`)
- **List View**: All brands with search and status filter
- **Actions**:
  - Approve pending brands
  - Reject brands with reason
  - View brand details
- **Columns**: Name, Owner, Location, Products, Commission, Status

### Products (`/admin/products`)
- **List View**: All products with status filter
- **Actions**:
  - Approve/reject pending products
  - Toggle featured status
  - View product details
- **Columns**: Product (with image), Brand, Price, Stock, Status, Featured

### Orders (`/admin/orders`)
- **List View**: All orders with status filter
- **Actions**:
  - Process pending orders
  - Ship processing orders
  - Cancel orders with reason
  - View order details
- **Columns**: Order ID, Customer, Brand, Items, Total, Status, Date

### Customers (`/admin/customers`)
- **List View**: All customers with search and status filter
- **Actions**:
  - Ban/unban customers
  - View customer details and order history
- **Columns**: Customer (with avatar), Email, Phone, Orders, Total Spent, Status

### Analytics (`/admin/analytics`)
- Stats overview cards
- Placeholder for charts (Sales, Products, Brands)
- Export functionality

### Settings (`/admin/settings`)
- Commission rate configuration
- Payment settings
- Email notification preferences

## 🔧 Setup & Usage

### Prerequisites
```bash
# Already installed in your project
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide Icons
```

### Access the Admin Panel

1. Start your development server:
```bash
npm run dev
```

2. Navigate to:
```
http://localhost:3000/admin
```

### Navigation

The admin panel uses a persistent sidebar with the following sections:
- Dashboard
- Brands
- Products
- Orders
- Customers
- Analytics
- Settings

## 🎯 Features by Page

### Dashboard Features
- Real-time statistics
- Trend indicators (up/down arrows)
- Quick access to recent activity
- Responsive grid layout

### Brand Management Features
- **Search**: Find brands by name
- **Filter**: By status (All, Active, Pending, Suspended, Rejected)
- **Approve**: One-click brand approval
- **Reject**: Reject with reason input
- **Pagination**: Navigate through pages

### Product Management Features
- **Filter**: By status
- **Image Preview**: Product thumbnail in list
- **Featured Toggle**: Star icon to feature/unfeature products
- **Approve/Reject**: For pending products

### Order Management Features
- **Status Progression**: Pending → Processing → Shipped → Delivered
- **Quick Actions**: Process, Ship, Cancel buttons
- **Status Filter**: View orders by status
- **Order Details**: View full order information

### Customer Management Features
- **Search**: Find customers by name or email
- **Avatar Display**: Shows customer initials if no avatar
- **Ban/Unban**: Toggle customer account status
- **Statistics**: View order count and total spent

## 🎨 Styling

### Color Scheme
- **Primary**: Purple (#9333EA)
- **Secondary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Background**: Gray-50 (#F9FAFB)

### Status Colors
- **Active/Delivered**: Green
- **Pending/Processing**: Yellow/Orange
- **Rejected/Banned/Cancelled**: Red

## 🔐 RBAC Integration

The admin panel is ready to integrate with the RBAC system:

```typescript
// Example: Check permissions
import { hasPermission, Permission, UserRole } from '@/src/lib/api/rbac/permissions';

const canApproveBrands = hasPermission(userRole, Permission.APPROVE_BRANDS);

if (canApproveBrands) {
  // Show approve button
}
```

### Role-Based Access

You can protect routes and features based on user roles:

```typescript
// In layout or page
useEffect(() => {
  const user = getCurrentUser();
  if (!isAdmin(user.role)) {
    router.push('/');
  }
}, []);
```

## 📊 Data Integration

### Using with MSW (Mock Service Worker)

The admin panel is already configured to work with MSW. The handlers in `src/mocks/handlers/adminHandlers.ts` provide mock data.

### Switching to Real API

Simply disable MSW and the admin panel will use the real API:

```typescript
// src/index.tsx or app entry
// Comment out or remove MSW initialization
// The AdminService will automatically use real endpoints
```

## 🛠️ Customization

### Adding New Pages

1. Create a new folder in `app/admin/`
2. Add a `page.tsx` file
3. Update navigation in `app/admin/layout.tsx`

```typescript
// In layout.tsx navigation array
{
  title: 'New Page',
  href: '/admin/new-page',
  icon: <IconName className="h-5 w-5" />,
}
```

### Modifying Tables

Tables use the reusable `Table` component:

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Adding Filters

Use the `Select` and `Input` components:

```typescript
<Card className="p-4">
  <div className="flex gap-4">
    <Input
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <Select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="">All</option>
      <option value="active">Active</option>
    </Select>
  </div>
</Card>
```

## 🚧 Future Enhancements

### Planned Features
- [ ] Advanced charts with Recharts/Chart.js
- [ ] Export functionality (CSV, Excel, PDF)
- [ ] Bulk actions (select multiple items)
- [ ] Advanced filters (date range, multiple criteria)
- [ ] Real-time updates with WebSocket
- [ ] Email template management
- [ ] Notification center
- [ ] Activity feed
- [ ] User role management UI
- [ ] Advanced analytics dashboard

### Recommended Additions
- [ ] Product image gallery viewer
- [ ] Order tracking visualization
- [ ] Customer lifetime value charts
- [ ] Revenue forecasting
- [ ] Inventory management
- [ ] Coupon/promotion management
- [ ] Banner management
- [ ] SEO settings
- [ ] API rate limiting dashboard

## 📱 Responsive Design

The admin panel is fully responsive:
- **Mobile**: Collapsible sidebar, touch-friendly buttons
- **Tablet**: Adaptive grid layouts
- **Desktop**: Full sidebar, optimized data tables

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔍 Search & Filter

### Global Search (Planned)
Add a global search bar in the header for quick navigation and searches.

### Advanced Filters
Each page includes relevant filters:
- Text search
- Status filters
- Date range filters (can be added)

## 💡 Tips

1. **Performance**: The tables use pagination to handle large datasets
2. **Loading States**: All pages show loading indicators while fetching data
3. **Error Handling**: API errors are caught and logged (can add toast notifications)
4. **Type Safety**: Full TypeScript support with proper types
5. **Reusability**: UI components are modular and reusable

## 🐛 Troubleshooting

### Sidebar not showing
- Check that you're accessing `/admin` route
- Verify layout.tsx is not being overridden

### Data not loading
- Check MSW is initialized (for development)
- Verify API endpoints are correct
- Check browser console for errors

### Styling issues
- Ensure Tailwind CSS is configured correctly
- Check that `globals.css` is imported
- Verify path aliases in tsconfig.json

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [MSW Documentation](https://mswjs.io/)

## 🎉 Getting Started

The admin UI is ready to use! Simply:

1. Run `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Explore the different sections
4. Customize as needed for your requirements

All pages are connected to the AdminService API layer and will work seamlessly with both mock data (MSW) and your real backend when ready.

---

**Built with ❤️ for DreamXStore**
