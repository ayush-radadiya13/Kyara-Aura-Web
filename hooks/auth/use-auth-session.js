"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { extractAuthToken, extractAuthUser } from "@/utils/auth-response";

/**
 * Persist auth from API response and invalidate profile cache.
 */
export function useAuthSession() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const applyAuthResponse = async (response) => {
    const token = extractAuthToken(response);
    const user = extractAuthUser(response);

    if (!token) {
      throw new Error("Access token not found in response");
    }

    setAuth({ user, token });
    await queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    return { user, token };
  };

  return { applyAuthResponse };
}
