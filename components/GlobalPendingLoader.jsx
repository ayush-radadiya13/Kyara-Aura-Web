"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageLoadingOverlay } from "@/components/PageLoadingOverlay";
import { useApiPendingStore } from "@/store/api-pending-store";
import "@/utils/api";

export default function GlobalPendingLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingCount = useApiPendingStore((state) => state.pendingCount);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const previousRouteKey = useRef(routeKey);
  const [navigationPending, setNavigationPending] = useState(false);

  useEffect(() => {
    if (previousRouteKey.current === routeKey) return;

    previousRouteKey.current = routeKey;
    setNavigationPending(true);
  }, [routeKey]);

  useEffect(() => {
    if (!navigationPending) return undefined;

    if (pendingCount === 0) {
      const timeoutId = window.setTimeout(() => {
        setNavigationPending(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [navigationPending, pendingCount]);

  if (!navigationPending) return null;

  return <PageLoadingOverlay />;
}
