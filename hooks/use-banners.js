"use client";

import { useQuery } from "@tanstack/react-query";
import { getBannerSettingsApi } from "@/services/banners";

/**
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useBanners(options = {}) {
  return useQuery({
    queryKey: ["banners"],
    queryFn: getBannerSettingsApi,
    refetchOnMount: "always",
    retry: false,
    ...options,
  });
}
