// src/services/api/endpoints.ts
// Centralized API endpoint paths for UBSSuper Customer App

export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  CUSTOMERS: {
    PROFILE: '/customers/profile',
    ADDRESSES: '/customers/addresses',
    PINCODE: (code: string) => `/customers/pincode/${code}`,
    DELETE_ACCOUNT: '/users/account',
  },

  CONTENT: {
    BANNERS: '/content/banners',
    COUPONS: '/content/coupons',
    STATUS: '/content/status',
  },
  TAXI: {
    ESTIMATE: '/taxi/estimate',
    BOOK: '/taxi/book',
    RIDE: (rideId: string) => `/taxi/rides/${rideId}`,
    CANCEL: (rideId: string) => `/taxi/rides/${rideId}/cancel`,
    NEARBY: '/taxi/nearby-drivers',
  },
  ORDERS: {
    CHECKOUT: '/orders/checkout',
    VERIFY_PAYMENT: '/orders/verify-payment',
    BY_ID: (orderId: string) => `/orders/${orderId}`,
    MY_ORDERS: '/orders/customer/my-orders',
  },
  GROCERY: {
    PRODUCTS: '/partners/grocery/products',
    CATEGORIES: '/content/categories',
  },
  STORES: {
    LIST: '/content/stores',
    BY_ID: (id: string) => `/content/stores/${id}`,
    PRODUCTS: (id: string) => `/content/stores/${id}/products`,
  },
};
