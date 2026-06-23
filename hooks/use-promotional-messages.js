"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useWebSettings } from "@/hooks/use-web-settings";
import { isBuyTwoGetOneFreeEnabled } from "@/lib/web-settings";
import { APP_ROUTES } from "@/lib/routes";
import { getOrdersApi } from "@/services/checkout";
import { useAuthStore } from "@/store/auth-store";

const BUY_TWO_GET_ONE_MESSAGE = "🎉 Buy 2, Get 1 Free! Limited Time Offer.";
const FIRST_ORDER_MESSAGE = "Get 50 RS OFF on your first order!";
const ONLINE_PAYMENT_MESSAGE = "Get 10% OFF when you pay online!";

export function usePromotionalMessages() {
  const pathname = usePathname();
  const { data: settings } = useWebSettings();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isCartPage = pathname === APP_ROUTES.CART;

  const ordersQuery = useQuery({
    queryKey: ["orders", "promo-banner"],
    queryFn: getOrdersApi,
    enabled: isHydrated && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const showFirstOrderMessage =
    isHydrated &&
    (!isAuthenticated ||
      (ordersQuery.isSuccess && (ordersQuery.data?.length ?? 0) === 0));

  const messages = [];

  if (isBuyTwoGetOneFreeEnabled(settings) && !isCartPage) {
    messages.push(BUY_TWO_GET_ONE_MESSAGE);
  }

  if (showFirstOrderMessage) {
    messages.push(FIRST_ORDER_MESSAGE);
  }

  messages.push(ONLINE_PAYMENT_MESSAGE);

  return {
    messages,
    hasMessages: messages.length > 0,
  };
}
