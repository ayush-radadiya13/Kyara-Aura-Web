"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

/**
 * Redirect authenticated users away from guest-only routes (login/register).
 * @param {{ redirectTo?: string }} [options]
 */
export function useAuthGuard(options = {}) {
  const router = useRouter();
  const { redirectTo = "/" } = options;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrated, redirectTo, router]);

  return { isAuthenticated, isHydrated };
}
