// API Configuration

export const API_CONFIG = {
  baseURL: (() => {
    // Priority: 
    // 1. NEXT_PUBLIC_API_URL environment variable
    // 2. Production Render Backend URL (if in production)
    // 3. Localhost (fallback for development)
    const productionUrl = 'https://dream-xstore-yashwanth-kumar.onrender.com';
    const url = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'production' ? productionUrl : 'http://localhost:3000');
    
    return url.endsWith('/api') ? url : `${url}/api`;
  })(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: (error: any) => {
    // Retry on network errors and 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

export const TOKEN_CONFIG = {
  tokenKey: 'token',
  refreshTokenKey: 'refreshToken',
  userKey: 'dreamx_user',
};

export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  GOOGLE_AUTH: '/auth/google',
  
  // Admin auth endpoints
  ADMIN_LOGIN: '/admin/login',
  
  // User endpoints
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  
  // Product endpoints
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  
  // Order endpoints
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  CREATE_ORDER: '/orders/create',
  
  // Cart endpoints
  CART: '/cart',
  ADD_TO_CART: '/cart/add',
  UPDATE_CART: '/cart/update',
  REMOVE_FROM_CART: (id: string) => `/cart/remove/${id}`,
  
  // Download endpoints
  DOWNLOAD_DESIGN: (designId: string, imageIndex: number) => 
    `/download/design/${designId}/image/${imageIndex}`,
  DOWNLOAD_INVOICE: (orderId: string) => `/download/order/${orderId}/invoice`,
  DOWNLOAD_USER_DATA: '/download/user/data',
  DOWNLOAD_CATALOG: '/download/catalog',
};
