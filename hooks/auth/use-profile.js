"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { extractProfile } from "@/utils/auth-response";
import { useAuthStore } from "@/store/auth-store";

/**
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useProfile(options = {}) {
  const { enabled, ...rest } = options;
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const data = await authService.getProfile();
      return extractProfile(data);
    },
    enabled: isHydrated && Boolean(token) && enabled !== false,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...rest,
  });
}
