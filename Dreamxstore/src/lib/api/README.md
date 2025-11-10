# API Client Layer Documentation

A clean, robust API client layer built with Axios that handles authentication, token refresh, error handling, and retries.

## Features

- ✅ **Request/Response Interceptors** - Automatic token injection and response handling
- ✅ **Token Refresh** - Automatic JWT token refresh on expiry
- ✅ **Global Error Handling** - Consistent error handling across the app
- ✅ **Retry Logic** - Automatic retry with exponential backoff for failed requests
- ✅ **TypeScript Support** - Full type safety with TypeScript
- ✅ **Service Layer** - Clean API service classes for different domains

## Installation

The required dependencies are already installed:
- `axios` - HTTP client
- `next` - Next.js framework

## Project Structure

```
src/lib/api/
├── client.ts              # Main Axios instance with interceptors
├── config.ts              # API configuration and endpoints
├── types.ts               # TypeScript type definitions
├── tokenManager.ts        # Token storage and refresh logic
├── errorHandler.ts        # Error handling utilities
├── services/
│   ├── authService.ts     # Authentication API calls
│   ├── productService.ts  # Product API calls
│   ├── orderService.ts    # Order API calls
│   └── userService.ts     # User API calls
└── index.ts               # Main export file
```

## Usage

### 1. Import the Services

```typescript
import { AuthService, ProductService, OrderService, UserService } from '@/lib/api';
```

### 2. Authentication

```typescript
// Login
try {
  const response = await AuthService.login('user@example.com', 'password');
  console.log('User:', response.user);
  console.log('Token:', response.token);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Signup
await AuthService.signup({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe'
});

// Logout
await AuthService.logout();

// Check authentication
const isAuth = AuthService.isAuthenticated();

// Google OAuth
AuthService.initiateGoogleLogin();
```

### 3. Products

```typescript
// Get all products
const products = await ProductService.getProducts({
  page: 1,
  limit: 20,
  category: 'electronics'
});

// Get product by ID
const product = await ProductService.getProductById('product-id');

// Search products
const results = await ProductService.searchProducts('laptop', {
  minPrice: 500,
  maxPrice: 2000
});

// Get featured products
const featured = await ProductService.getFeaturedProducts(10);
```

### 4. Orders

```typescript
// Create order
const order = await OrderService.createOrder({
  items: [
    {
      productId: 'prod-123',
      name: 'Product Name',
      price: 99.99,
      quantity: 2
    }
  ],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    pincode: '10001',
    phone: '+1234567890'
  },
  paymentMethod: 'credit_card'
});

// Get orders
const orders = await OrderService.getOrders(1, 10);

// Get order by ID
const order = await OrderService.getOrderById('order-id');

// Cancel order
await OrderService.cancelOrder('order-id');

// Download invoice
await OrderService.downloadInvoice('order-id');
```

### 5. User Profile

```typescript
// Get profile
const user = await UserService.getProfile();

// Update profile
await UserService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890'
});

// Change password
await UserService.changePassword({
  currentPassword: 'oldpass',
  newPassword: 'newpass'
});

// Upload avatar
const file = document.getElementById('file-input').files[0];
const { url } = await UserService.uploadAvatar(file);

// Manage addresses
const addresses = await UserService.getAddresses();
await UserService.addAddress({...addressData});
await UserService.updateAddress('address-id', {...updates});
await UserService.deleteAddress('address-id');
```

### 6. Direct API Client Usage

For custom endpoints not covered by services:

```typescript
import { apiClient } from '@/lib/api';

// GET request
const data = await apiClient.get('/custom/endpoint');

// POST request
const result = await apiClient.post('/custom/endpoint', { key: 'value' });

// PUT request
await apiClient.put('/custom/endpoint/123', { key: 'updated' });

// DELETE request
await apiClient.delete('/custom/endpoint/123');

// Upload with progress
await apiClient.upload('/upload', formData, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// Download file
await apiClient.download('/download/file', 'filename.pdf');
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API Configuration

Edit `config.ts` to customize:

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds
};

export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000, // 1 second
};
```

## Error Handling

The API client automatically handles errors and provides user-friendly messages:

```typescript
import { ApiErrorHandler } from '@/lib/api';

try {
  await ProductService.getProductById('invalid-id');
} catch (error) {
  // Get user-friendly message
  const message = ApiErrorHandler.getUserFriendlyMessage(error);
  
  // Get error notification
  const notification = ApiErrorHandler.createErrorNotification(error);
  
  // Check error type
  const isAuthError = ApiErrorHandler.isAuthError(error);
  const isNetworkError = ApiErrorHandler.isNetworkError(error);
}
```

## Token Management

The token manager handles authentication tokens automatically:

```typescript
import { TokenManager } from '@/lib/api';

// Get token
const token = TokenManager.getToken();

// Check if authenticated
const isAuth = TokenManager.isAuthenticated();

// Manually logout
TokenManager.logout();
```

## Interceptors

### Request Interceptor

Automatically adds:
- Authorization header with JWT token
- Development logging

### Response Interceptor

Automatically handles:
- Token refresh on 401 errors
- Request retry on network/server errors
- Error normalization
- Development logging

## Retry Logic

Failed requests are automatically retried with:
- **Exponential backoff** - Delay increases with each retry
- **Max retries** - Default 3 attempts
- **Smart conditions** - Only retries network errors and 5xx server errors

## Advanced Usage

### Skip Authentication

```typescript
const data = await apiClient.get('/public/endpoint', { skipAuth: true });
```

### Skip Retry

```typescript
const data = await apiClient.get('/endpoint', { skipRetry: true });
```

### Custom Retry Configuration

```typescript
const data = await apiClient.post('/endpoint', data, {
  retry: {
    retries: 5,
    retryDelay: 2000
  }
});
```

## Migration Guide

### Replacing fetch calls

Before:
```typescript
const response = await fetch(`${API_URL}/products`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

After:
```typescript
const data = await ProductService.getProducts();
```

### Replacing axios calls

Before:
```typescript
const response = await axios.get(`${API_URL}/products`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
const data = response.data;
```

After:
```typescript
const data = await ProductService.getProducts();
```

## Best Practices

1. **Use Service Classes** - Always use service classes instead of direct API calls
2. **Handle Errors** - Always wrap API calls in try-catch blocks
3. **Type Safety** - Use TypeScript types provided by the services
4. **Token Management** - Let the client handle tokens automatically
5. **Environment Variables** - Use environment variables for API URLs

## Testing

```typescript
// Mock the API client in tests
jest.mock('@/lib/api', () => ({
  ProductService: {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
  },
  AuthService: {
    login: jest.fn(),
    logout: jest.fn(),
  }
}));
```

## Troubleshooting

### Token not being sent
- Check if token exists in localStorage
- Verify `NEXT_PUBLIC_API_URL` is set correctly

### Requests failing
- Check network tab in browser devtools
- Verify backend is running
- Check CORS configuration

### Token refresh not working
- Verify backend has `/auth/refresh` endpoint
- Check if refresh token is being stored

## Support

For issues or questions:
1. Check the error message in console
2. Review the API documentation
3. Check backend logs
4. Verify network requests in DevTools
