"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";

/**
 * @param {import("@tanstack/react-query").UseMutationOptions} [options]
 */
export function useVerifyOtp(options = {}) {
  return useMutation({
    mutationFn: ({ payload, useAuth = false }) => authService.verifyOtp(payload, { useAuth }),
    ...options,
  });
}
