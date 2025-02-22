// src/config/api.js
const getBaseUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000';
  }
  return 'https://bindis-cupcakery.onrender.com';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  // Auth endpoints
  login: '/auth/login',
  register: '/auth/register',
  adminLogin: '/auth/admin/login',
  isVerify: '/auth/is-verify',
  userProfile: '/auth/user-data',
  
  // Admin endpoints
  adminCategories: '/admin/categories',
  adminProducts: '/admin/products',
  currentOrders: '/admin/current-orders',
  orderHistory: '/admin/order-history',
  orderStatus: (orderId) => `/admin/current-orders/${orderId}/status`,
  pickupStatus: (orderId) => `/admin/current-orders/${orderId}/pickup-status`,
  orderPickup: (orderId) => `/admin/current-orders/${orderId}/pickup`,
  
  // Product endpoints
  products: '/products',
  homeProducts: '/products/home',
  categories: '/categories',
  productDetails: (id) => `/products/${id}`,
  productsByCategory: (categoryName) => `/products/category/${categoryName}`,
  randomProducts: (productId) => `/products/random/${productId}`,
  
  // Cart endpoints
  cart: '/cart',
  checkout: '/cart/checkout',
  
  // Payment endpoints
  payment: (paymentId) => `/payment/${paymentId}`,
  paymentStatus: '/payment/status',
  paymentVerify: (transactionId) => `/payment/verify/${transactionId}`,
  paymentInitiate: '/payment/initiate',
  
  // Order endpoints
  orders: '/orders',
  orderSearch: '/orders/search',
  currentOrder: '/track/current-order',
  orderTracking: '/track',
  trackOrder: '/track',
  
  // Review endpoints
  reviews: '/api/reviews',
  reviewSubmit: '/api/reviews/submit',
  reviewMarkShown: '/api/reviews/mark-shown',
  reviewHomepage: '/admin/reviews/homepage',
  adminReviews: '/admin/reviews',
  reviewToggleHomepage: (reviewId) => `/admin/reviews/${reviewId}/toggle-homepage`,
  pendingReviews: (userId) => `/api/reviews/pending/${userId}`,
  
  // Hamper endpoints
  hampers: '/hampers',
  randomHampers: (hamperId) => `/hampers/random/${hamperId}`,
  
  // WhatsApp endpoints
  whatsapp: '/api/whatsapp',
  
  // Dashboard endpoints
  dashboard: '/dashboard',
  userDashboard: '/dashboard'
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;