"use client";

import { useWebSettings } from "@/hooks/use-web-settings";
import { getOfferLines } from "@/lib/web-settings";

export function usePromotionalMessages() {
  const { data: settings } = useWebSettings();
  const messages = getOfferLines(settings);

  return {
    messages,
    hasMessages: messages.length > 0,
  };
}
