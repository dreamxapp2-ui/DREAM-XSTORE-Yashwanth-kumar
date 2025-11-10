// API Client Usage Examples

import React, { useState, useEffect } from 'react';
import {
  AuthService,
  ProductService,
  OrderService,
  UserService,
  ApiErrorHandler,
  type Product,
  type Order,
  type ApiError,
} from './index';

/**
 * Example 1: Login Component
 */
export function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthService.login(email, password);
      console.log('Logged in:', response.user);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      const apiError = err as ApiError;
      setError(ApiErrorHandler.getUserFriendlyMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

/**
 * Example 2: Product List Component
 */
export function ProductListExample() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await ProductService.getProducts({
        page,
        limit: 20,
      });
      setProducts(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(ApiErrorHandler.getUserFriendlyMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Example 3: Search Component with Debouncing
 */
export function ProductSearchExample() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        searchProducts();
      } else {
        setProducts([]);
      }
    }, 500); // Debounce delay

    return () => clearTimeout(timer);
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.searchProducts(query);
      setProducts(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      {loading && <div>Searching...</div>}
      <div className="search-results">
        {products.map((product) => (
          <div key={product._id}>{product.name}</div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Checkout Component
 */
export function CheckoutExample() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (cartItems: any[], shippingAddress: any) => {
    setProcessing(true);
    setError('');

    try {
      const order = await OrderService.createOrder({
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'credit_card',
      });

      console.log('Order created:', order);
      // Redirect to success page
      window.location.href = `/order-success/${order._id}`;
    } catch (err) {
      const apiError = err as ApiError;
      setError(ApiErrorHandler.getUserFriendlyMessage(apiError));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button
        onClick={() => handleCheckout([], {})}
        disabled={processing}
      >
        {processing ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}

/**
 * Example 5: Profile Update Component
 */
export function ProfileUpdateExample() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await UserService.getProfile();
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await UserService.updateProfile(profile);
      setSuccess(true);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={profile.firstName}
        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
        placeholder="First Name"
      />
      <input
        type="text"
        value={profile.lastName}
        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
        placeholder="Last Name"
      />
      {success && <div className="success">Profile updated!</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}

/**
 * Example 6: File Upload Component
 */
export function AvatarUploadExample() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await UserService.uploadAvatar(file);
      console.log('Avatar uploaded:', url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileSelect}
        accept="image/*"
        disabled={uploading}
      />
      {uploading && <div>Uploading... {progress}%</div>}
    </div>
  );
}

/**
 * Example 7: Order History Component
 */
export function OrderHistoryExample() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await OrderService.getOrders(1, 10);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      await OrderService.downloadInvoice(orderId);
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await OrderService.cancelOrder(orderId);
      loadOrders(); // Reload orders
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <h3>Order #{order._id}</h3>
          <p>Status: {order.orderStatus}</p>
          <p>Total: ${order.total}</p>
          <button onClick={() => handleDownloadInvoice(order._id)}>
            Download Invoice
          </button>
          {order.orderStatus === 'pending' && (
            <button onClick={() => handleCancelOrder(order._id)}>
              Cancel Order
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Example 8: Protected Route HOC
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      const authenticated = AuthService.isAuthenticated();
      
      if (!authenticated) {
        window.location.href = '/login';
        return;
      }

      setIsAuth(true);
    };

    if (isAuth === null) {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
}

/**
 * Example 9: Custom Hook for API Calls
 */
export function useProducts(filters?: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [JSON.stringify(filters)]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.getProducts(filters);
      setProducts(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(ApiErrorHandler.getUserFriendlyMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: loadProducts };
}

// Usage of custom hook
export function ProductsWithHook() {
  const { products, loading, error } = useProducts({ featured: true });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
