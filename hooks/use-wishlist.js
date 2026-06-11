"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addWishlistItemApi,
  clearWishlistApi,
  deleteWishlistItemApi,
  getWishlistApi,
  updateWishlistItemApi,
} from "@/services/wishlist";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export function useWishlist(options = {}) {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: getWishlistApi,
    refetchOnMount: "always",
    retry: false,
    ...options,
  });
}

export function useAddWishlistItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWishlistItemApi,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateWishlistItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wishlistId, productId }) => updateWishlistItemApi(wishlistId, productId),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteWishlistItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWishlistItemApi,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useClearWishlist(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearWishlistApi,
    ...options,
    onSuccess: (...args) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, []);
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}
