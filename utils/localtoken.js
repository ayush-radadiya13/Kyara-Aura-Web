import { AUTH_COOKIE_KEY, AUTH_TOKEN_STORAGE_KEY } from "@/lib/constants";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
