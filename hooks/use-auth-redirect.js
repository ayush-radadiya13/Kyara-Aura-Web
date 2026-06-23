'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  function redirectToLogin(from) {
    const queryString = searchParams.toString();
    const currentPath = from ?? `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.push(withRedirect(AUTH_PAGE_ROUTES.LOGIN, currentPath));
  }

  function requireAuth(options = {}) {
    if (!isHydrated) return false;
    if (!isAuthenticated) {
      redirectToLogin(options.from);
      return false;
    }
    return true;
  }

  return { isAuthenticated, isHydrated, requireAuth, redirectToLogin };
}
