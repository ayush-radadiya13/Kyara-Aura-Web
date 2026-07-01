"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";

/**
 * @param {import("@tanstack/react-query").UseMutationOptions} [options]
 */
export function useUpdateProfile(options = {}) {
  return useMutation({
    mutationFn: (payload) => authService.updateProfile(payload),
    ...options,
  });
}
