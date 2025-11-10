# Quick Start Guide - API Client

Get started with the new API client layer in 5 minutes!

## 1. Import Services

```typescript
import { AuthService, ProductService, OrderService, UserService } from '@/lib/api';
```

## 2. Make Your First API Call

### Authentication
```typescript
// Login
const handleLogin = async () => {
  try {
    const { user, token } = await AuthService.login('user@email.com', 'password');
    console.log('Welcome', user.username);
    // Token is automatically stored and managed
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Fetch Products
```typescript
// Get products
const loadProducts = async () => {
  try {
    const response = await ProductService.getProducts({ 
      page: 1, 
      limit: 20 
    });
    
    console.log('Products:', response.data);
    console.log('Total pages:', response.totalPages);
  } catch (error) {
    console.error('Failed to load products:', error.message);
  }
};
```

### Create Order
```typescript
// Create order
const checkout = async () => {
  try {
    const order = await OrderService.createOrder({
      items: [
        { productId: '123', name: 'Product', price: 99, quantity: 2 }
      ],
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St',
        city: 'NYC',
        state: 'NY',
        country: 'USA',
        pincode: '10001',
        phone: '+1234567890'
      },
      paymentMethod: 'credit_card'
    });
    
    console.log('Order created:', order._id);
  } catch (error) {
    console.error('Checkout failed:', error.message);
  }
};
```

## 3. Use in React Components

### Simple Component
```typescript
import React, { useState, useEffect } from 'react';
import { ProductService, type Product } from '@/lib/api';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await ProductService.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## 4. Handle Errors Properly

```typescript
import { ApiErrorHandler, type ApiError } from '@/lib/api';

try {
  await AuthService.login(email, password);
} catch (err) {
  const error = err as ApiError;
  
  // Get user-friendly message
  const message = ApiErrorHandler.getUserFriendlyMessage(error);
  
  // Check error type
  if (ApiErrorHandler.isAuthError(error)) {
    // Handle auth error
    redirectToLogin();
  } else if (ApiErrorHandler.isNetworkError(error)) {
    // Handle network error
    showOfflineMessage();
  }
  
  // Show error to user
  alert(message);
}
```

## 5. Custom API Calls

For endpoints not covered by services:

```typescript
import { apiClient } from '@/lib/api';

// GET
const data = await apiClient.get('/custom/endpoint');

// POST
const result = await apiClient.post('/custom/endpoint', { key: 'value' });

// Upload with progress
await apiClient.upload('/upload', formData, (progress) => {
  console.log(`Progress: ${progress}%`);
});

// Download file
await apiClient.download('/download/file', 'filename.pdf');
```

## 6. Check Authentication

```typescript
import { AuthService } from '@/lib/api';

// Check if user is authenticated
if (AuthService.isAuthenticated()) {
  // User is logged in
} else {
  // Redirect to login
  router.push('/login');
}

// Get stored user (without API call)
const user = AuthService.getStoredUser();
```

## 7. Protected Routes

```typescript
// In your layout or protected page
useEffect(() => {
  if (!AuthService.isAuthenticated()) {
    router.push('/login');
  }
}, []);
```

## Common Use Cases

### Search Products
```typescript
const results = await ProductService.searchProducts('laptop', {
  minPrice: 500,
  maxPrice: 2000,
  category: 'electronics'
});
```

### Update Profile
```typescript
await UserService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890'
});
```

### Upload Avatar
```typescript
const file = fileInput.files[0];
const { url } = await UserService.uploadAvatar(file);
```

### Download Invoice
```typescript
await OrderService.downloadInvoice('order-id');
```

### Cancel Order
```typescript
await OrderService.cancelOrder('order-id');
```

## Environment Setup

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## TypeScript Types

All services provide full TypeScript support:

```typescript
import type { 
  Product, 
  Order, 
  User,
  ApiError,
  PaginatedResponse 
} from '@/lib/api';
```

## Tips

1. **Always use try-catch** - API calls can fail
2. **Handle loading states** - Show loading indicators
3. **Use TypeScript types** - Get auto-completion and type safety
4. **Let the client handle tokens** - Don't manage tokens manually
5. **Check authentication** - Use `AuthService.isAuthenticated()`

## Need Help?

- Check `README.md` for detailed documentation
- See `examples.tsx` for more usage patterns
- Review `types.ts` for available types

## That's It! 🎉

You're ready to use the API client. The client handles:
- ✅ Token management
- ✅ Error handling
- ✅ Request retries
- ✅ Token refresh
- ✅ Type safety

Just focus on building your features!
