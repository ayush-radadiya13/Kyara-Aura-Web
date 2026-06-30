"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { useCartStore } from "@/lib/cart/store";
import { useAuthStore } from "@/store/auth-store";

/**
 * @param {import("@tanstack/react-query").UseMutationOptions} [options]
 */
export function useLogout(options = {}) {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  const { onSettled: userOnSettled, ...rest } = options;

  return useMutation({
    mutationFn: () => authService.logout(),
    ...rest,
    onSettled: async (data, error, variables, context) => {
      logoutStore();
      useCartStore.getState().clearCart();
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      await queryClient.removeQueries({ queryKey: ["auth", "profile"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      await userOnSettled?.(data, error, variables, context);
    },
  });
}
