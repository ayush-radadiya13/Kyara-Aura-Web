"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCategoriesApi,
  getCategoryBySlugApi,
} from "@/services/categories";

/**
 * @param {import("@tanstack/react-query").UseQueryOptions & { type?: string }} [options]
 */
export function useCategories(options = {}) {
  const { type, ...rest } = options;

  return useQuery({
    queryKey: type ? ["categories", { type }] : ["categories"],
    queryFn: () => getCategoriesApi(type),
    refetchOnMount: "always",
    retry: false,
    ...rest,
  });
}

/**
 * @param {string} categorySlug
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useCategoryBySlug(categorySlug, options = {}) {
  const { enabled, ...rest } = options;

  return useQuery({
    queryKey: ["categories", categorySlug],
    queryFn: () => getCategoryBySlugApi(categorySlug),
    enabled: Boolean(categorySlug) && enabled !== false,
    refetchOnMount: "always",
    retry: false,
    ...rest,
  });
}
