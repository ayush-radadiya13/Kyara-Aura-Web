"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { clearStoredScratchCoupon } from "@/services/scratch-card";
import { getAuthStorageKey } from "@/utils/auth-response";
import { clearAuthToken, setAuthToken } from "@/utils/localtoken";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: ({ user, token }) =>
        set(() => {
          if (token) setAuthToken(token);
          return { user, token, isAuthenticated: Boolean(token) };
        }),
      logout: () =>
        set((state) => {
          clearStoredScratchCoupon(getAuthStorageKey(state.user, state.token));
          clearAuthToken();
          return { user: null, token: null, isAuthenticated: false };
        }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token);
        }
        state?.setHydrated(true);
      },
    }
  )
);
