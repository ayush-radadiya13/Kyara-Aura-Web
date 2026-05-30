"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedProductsApi,
  getProductBySlugApi,
  getProductsApi,
  getProductsByCategoryApi,
} from "@/services/products";

export function useProducts(options = {}) {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProductsApi,
    refetchOnMount: "always",
    retry: false,
    ...options,
  });
}

export function useFeaturedProducts(options = {}) {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: getFeaturedProductsApi,
    refetchOnMount: "always",
    retry: false,
    ...options,
  });
}

export function useProductsByCategory(categoryId, options = {}) {
  const { enabled, ...rest } = options;

  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: () => getProductsByCategoryApi(categoryId),
    enabled: Boolean(categoryId) && enabled !== false,
    refetchOnMount: "always",
    retry: false,
    ...rest,
  });
}

export function useProductBySlug(productSlug, options = {}) {
  const { enabled, ...rest } = options;

  return useQuery({
    queryKey: ["products", productSlug],
    queryFn: () => getProductBySlugApi(productSlug),
    enabled: Boolean(productSlug) && enabled !== false,
    refetchOnMount: "always",
    retry: false,
    ...rest,
  });
}
