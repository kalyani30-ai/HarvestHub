const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Customer Auth
  customerLogin: (email: string, password: string) =>
    apiRequest('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  customerRegister: (userData: any) =>
    apiRequest('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Farmer Auth
  farmerLogin: (email: string, password: string) =>
    apiRequest('/auth/farmer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  farmerRegister: (farmerData: any) =>
    apiRequest('/auth/farmer/register', {
      method: 'POST',
      body: JSON.stringify(farmerData),
    }),

  // Verify Token
  verifyToken: () => apiRequest('/auth/verify'),
};

// Products API
export const productsAPI = {
  getAllProducts: (filters?: any) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/products?${params}`);
  },

  getProductById: (id: string) => apiRequest(`/products/${id}`),

  getProductsByFarmer: (farmerId: string) => apiRequest(`/products/farmer/${farmerId}`),

  searchProducts: (query: string) => apiRequest(`/products/search?q=${encodeURIComponent(query)}`),

  getCategories: () => apiRequest('/products/categories'),
};

// Cart API
export const cartAPI = {
  getCart: () => apiRequest('/cart'),

  addToCart: (productId: string, quantity: number) =>
    apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (itemId: string, quantity: number) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (itemId: string) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    apiRequest('/cart/clear', {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersAPI = {
  getOrders: () => apiRequest('/orders'),

  getOrderById: (orderId: string) => apiRequest(`/orders/${orderId}`),

  createOrder: (orderData: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  updateOrderStatus: (orderId: string, status: string) =>
    apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => apiRequest('/wishlist'),

  addToWishlist: (productId: string) =>
    apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  removeFromWishlist: (productId: string) =>
    apiRequest(`/wishlist/${productId}`, {
      method: 'DELETE',
    }),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: string) => apiRequest(`/reviews/product/${productId}`),

  addReview: (productId: string, reviewData: any) =>
    apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, ...reviewData }),
    }),

  updateReview: (reviewId: string, reviewData: any) =>
    apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),

  deleteReview: (reviewId: string) =>
    apiRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Farmer API
export const farmerAPI = {
  getFarmerProfile: (farmerId: string) => apiRequest(`/farmers/${farmerId}`),

  updateFarmerProfile: (farmerId: string, profileData: any) =>
    apiRequest(`/farmers/${farmerId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  addProduct: (productData: any) =>
    apiRequest('/farmers/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (productId: string, productData: any) =>
    apiRequest(`/farmers/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (productId: string) =>
    apiRequest(`/farmers/products/${productId}`, {
      method: 'DELETE',
    }),

  getFarmerOrders: () => apiRequest('/farmers/orders'),
};

// Customer API
export const customerAPI = {
  getCustomerProfile: (customerId: string) => apiRequest(`/customers/${customerId}`),

  updateCustomerProfile: (customerId: string, profileData: any) =>
    apiRequest(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  updateAddress: (customerId: string, address: string) =>
    apiRequest(`/customers/${customerId}/address`, {
      method: 'PUT',
      body: JSON.stringify({ address }),
    }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => apiRequest('/notifications'),

  markAsRead: (notificationId: string) =>
    apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    apiRequest('/notifications/read-all', {
      method: 'PUT',
    }),
};

// Analytics API
export const analyticsAPI = {
  getSalesAnalytics: (period: string) => apiRequest(`/analytics/sales?period=${period}`),

  getProductAnalytics: () => apiRequest('/analytics/products'),

  getCustomerAnalytics: () => apiRequest('/analytics/customers'),
};

// Terms API
export const termsAPI = {
  getTerms: () => apiRequest('/terms'),
};

export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  wishlist: wishlistAPI,
  reviews: reviewsAPI,
  farmer: farmerAPI,
  customer: customerAPI,
  notifications: notificationsAPI,
  analytics: analyticsAPI,
  terms: termsAPI,
}; 