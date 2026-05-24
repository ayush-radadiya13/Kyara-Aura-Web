"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";

/**
 * @param {import("@tanstack/react-query").UseMutationOptions} [options]
 */
export function useLogin(options = {}) {
  return useMutation({
    mutationFn: (payload) => authService.login(payload),
    ...options,
  });
}
