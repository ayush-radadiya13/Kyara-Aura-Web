"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
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
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      await queryClient.removeQueries({ queryKey: ["auth", "profile"] });
      await userOnSettled?.(data, error, variables, context);
    },
  });
}
