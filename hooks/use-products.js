"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCollectionProductsApi,
  getFeaturedProductsApi,
  getProductBySlugApi,
  getProductsApi,
  getProductsByCategoryApi,
  searchProductsByNameApi,
} from "@/services/products";
import { DEFAULT_PRODUCTS_PER_PAGE } from "@/lib/products";

export function useProducts({
  page = 1,
  perPage = DEFAULT_PRODUCTS_PER_PAGE,
  paginated = false,
  ...options
} = {}) {
  return useQuery({
    queryKey: paginated
      ? ["products", { page, perPage }]
      : ["products", { perPage }],
    queryFn: async () => {
      const result = await getProductsApi({ page, perPage });
      return paginated ? result : result.products;
    },
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

export function useCollectionProducts(options = {}) {
  return useQuery({
    queryKey: ["products", "collection"],
    queryFn: getCollectionProductsApi,
    refetchOnMount: "always",
    retry: false,
    ...options,
  });
}

export function useProductsByCategory(categoryId, {
  page = 1,
  perPage = DEFAULT_PRODUCTS_PER_PAGE,
  paginated = false,
  enabled,
  ...rest
} = {}) {
  return useQuery({
    queryKey: paginated
      ? ["products", "category", categoryId, { page, perPage }]
      : ["products", "category", categoryId, { perPage }],
    queryFn: async () => {
      const result = await getProductsByCategoryApi(categoryId, { page, perPage });
      return paginated ? result : result.products;
    },
    enabled: Boolean(categoryId) && enabled !== false,
    refetchOnMount: "always",
    retry: false,
    ...rest,
  });
}

export function useProductNameSearch(name, options = {}) {
  const { enabled, ...rest } = options;
  const trimmedName = String(name ?? "").trim();

  return useQuery({
    queryKey: ["products", "name-search", trimmedName],
    queryFn: () => searchProductsByNameApi(trimmedName),
    enabled: Boolean(trimmedName) && enabled !== false,
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
