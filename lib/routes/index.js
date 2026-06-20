export const APP_ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  COLLECTIONS: "/collections",
  ORDERS: "/orders",
  WISHLIST: "/wishlist",
  CART: "/cart",
  PAYMENT_METHOD: "/payment-method",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  SHIPPING_POLICY: "/shipping-policy",
};

export const AUTH_API_ROUTES = {
  REGISTER: "api/auth/register",
  LOGIN: "api/auth/login",
  PROFILE: "api/auth/profile",
  LOGOUT: "api/auth/logout",
  FORGOT_PASSWORD: "api/auth/forgot-password",
  RESET_PASSWORD: "api/auth/reset-password",
  VERIFY_EMAIL: "api/auth/verify-email",
};

export const AUTH_PAGE_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

export const CATEGORY_API_ROUTES = {
  LIST: "api/categories",
  DETAIL: (categorySlug) => `api/categories/${categorySlug}`,
};

export const SIZE_API_ROUTES = {
  LIST: "api/sizes",
};

export const PRODUCT_API_ROUTES = {
  LIST: "api/products",
  DETAIL: (productSlug) => `api/products/${productSlug}`,
  FEATURED: "api/products/featured",
  COLLECTION: "api/products/collection",
  CATEGORY: (categoryId) => `api/products/category/${categoryId}`,
  NAME_SEARCH: "api/products/name-search",
};

export const CART_API_ROUTES = {
  ADD: "api/cart/add",
  LIST: "api/cart",
  REMOVE: (itemId) => `api/cart/remove/${itemId}`,
  CLEAR: "api/cart/clear",
  UPDATE_QUANTITY: "api/cart/update-quantity",
};

export const WISHLIST_API_ROUTES = {
  LIST: "api/wishlist",
  CREATE: "api/wishlist",
  DETAIL: (wishlistId) => `api/wishlist/${wishlistId}`,
  UPDATE: (wishlistId) => `api/wishlist/${wishlistId}`,
  DELETE: (wishlistId) => `api/wishlist/${wishlistId}`,
  CLEAR: "api/wishlist/clear",
};

export const ADDRESS_API_ROUTES = {
  LIST: "api/addresses",
  CREATE: "api/addresses",
  DETAIL: (addressId) => `api/addresses/${addressId}`,
  UPDATE: (addressId) => `api/addresses/${addressId}`,
  DELETE: (addressId) => `api/addresses/${addressId}`,
  SET_DEFAULT: (addressId) => `api/addresses/${addressId}/default`,
};

export const CHECKOUT_API_ROUTES = {
  SUMMARY: "api/checkout/summary",
  CREATE_ORDER: "api/orders/create",
  SEND_COD_OTP: "api/orders/cod/send-otp",
  VERIFY_RAZORPAY_PAYMENT: "api/razorpay/payment/verify",
  ORDERS: "api/orders",
  ORDER_DETAIL: (orderId) => `api/orders/${orderId}`,
  INVOICE_DOWNLOAD: (orderId) => `api/orders/${orderId}/invoice/download`,
  CANCEL_ORDER: (orderId) => `api/orders/${orderId}/cancel`,
  RETURN_ORDER: (orderId) => `api/orders/${orderId}/return`,
};

export const SCRATCH_CARD_API_ROUTES = {
  STATUS: "api/scratch-card/status",
  SCRATCH: "api/scratch-card/scratch",
};

export const WEB_SETTINGS_API_ROUTES = {
  GET: "api/web-settings",
};

export const CUSTOMER_REVIEWS_API_ROUTES = {
  CREATE: "api/customer-reviews",
};

export function withRedirect(route, from) {
  const params = new URLSearchParams({ from });
  return `${route}?${params.toString()}`;
}
