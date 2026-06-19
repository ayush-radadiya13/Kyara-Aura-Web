"use client";

import { useQuery } from "@tanstack/react-query";
import { getWebSettingsApi } from "@/services/web-settings";

/**
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useWebSettings(options = {}) {
  return useQuery({
    queryKey: ["web-settings"],
    queryFn: getWebSettingsApi,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    retry: false,
    ...options,
  });
}
