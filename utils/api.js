"use client";

import axios from "axios";
import { API_BASE } from "@/lib/api-base";
import { AUTH_API_ROUTES, AUTH_PAGE_ROUTES } from "@/lib/routes";
import { useApiPendingStore } from "@/store/api-pending-store";
import { useAuthStore } from "@/store/auth-store";
import { getAuthToken } from "@/utils/localtoken";

let isRedirectingToLogin = false;

const AUTH_PAGE_PATHS = new Set(Object.values(AUTH_PAGE_ROUTES));
const AUTH_REQUEST_PATHS = new Set([
  AUTH_API_ROUTES.LOGIN,
  AUTH_API_ROUTES.REGISTER,
  AUTH_API_ROUTES.SEND_OTP,
  AUTH_API_ROUTES.FORGOT_PASSWORD,
  AUTH_API_ROUTES.RESET_PASSWORD,
  AUTH_API_ROUTES.VERIFY_EMAIL,
  AUTH_API_ROUTES.VERIFY_OTP,
]);

function isAuthRequest(url) {
  if (!url) return false;
  return AUTH_REQUEST_PATHS.has(url.replace(/^\/+/, ""));
}

function redirectToLogin() {
  if (typeof window === "undefined") return;

  useAuthStore.getState().logout();

  if (AUTH_PAGE_PATHS.has(window.location.pathname) || isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;
  window.location.replace(AUTH_PAGE_ROUTES.LOGIN);
}

const TRACKED_HTTP_METHODS = new Set(["get", "head"]);

function shouldTrackPendingRequest(config) {
  const method = String(config?.method ?? "get").toLowerCase();
  return TRACKED_HTTP_METHODS.has(method);
}

function trackPendingRequest(config) {
  if (shouldTrackPendingRequest(config)) {
    useApiPendingStore.getState().increment();
    config.__trackPending = true;
  }

  return config;
}

function releasePendingRequest(config) {
  if (config?.__trackPending) {
    useApiPendingStore.getState().decrement();
  }
}

function attachPendingRequestTracking(instance) {
  instance.interceptors.request.use(
    (config) => trackPendingRequest(config),
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => {
      releasePendingRequest(response.config);
      return response;
    },
    (error) => {
      releasePendingRequest(error.config);
      return Promise.reject(error);
    },
  );
}

export const customAxios = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

customAxios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

customAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export const withoutTokenApi = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

attachPendingRequestTracking(customAxios);
attachPendingRequestTracking(withoutTokenApi);
