"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";

/**
 * @param {import("@tanstack/react-query").UseMutationOptions} [options]
 */
export function useResetPassword(options = {}) {
  return useMutation({
    mutationFn: (payload) => authService.resetPassword(payload),
    ...options,
  });
}
