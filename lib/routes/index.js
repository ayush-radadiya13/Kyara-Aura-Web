export const APP_ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  COLLECTIONS: "/collections",
  ORDERS: "/orders",
  WISHLIST: "/wishlist",
  CART: "/cart",
  TERMS: "/terms",
  PRIVACY: "/privacy",
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
  VERIFY_EMAIL: "/verify-email",
};

export const CATEGORY_API_ROUTES = {
  LIST: "api/categories",
  DETAIL: (categorySlug) => `api/categories/${categorySlug}`,
};

export const PRODUCT_API_ROUTES = {
  LIST: "api/products",
  DETAIL: (productSlug) => `api/products/${productSlug}`,
  FEATURED: "api/products/featured",
  CATEGORY: (categoryId) => `api/products/category/${categoryId}`,
};

export const CART_API_ROUTES = {
  ADD: "api/cart/add",
  LIST: "api/cart",
  REMOVE: (itemId) => `api/cart/remove/${itemId}`,
  CLEAR: "api/cart/clear",
  UPDATE_QUANTITY: "api/cart/update-quantity",
};

export function withRedirect(route, from) {
  const params = new URLSearchParams({ from });
  return `${route}?${params.toString()}`;
}
