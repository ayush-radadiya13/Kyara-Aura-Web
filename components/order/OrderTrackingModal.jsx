'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import OrderTracking from '@/components/order/OrderTracking';
import { LoaderBlock } from '@/components/ui/loader';
import { useScrollLock } from '@/hooks/use-scroll-lock';

function resolveOrderNumber(order) {
  const value = order?.order_number ?? order?.orderNumber ?? order?.id;
  if (!value) return '';

  const stringValue = String(value);
  return stringValue.startsWith('#') ? stringValue : `#${stringValue}`;
}

export default function OrderTrackingModal({ open, loading, order, onClose }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const orderNumber = resolveOrderNumber(order);

  return (
    <div
      className="tracking-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-title"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close tracking dialog"
        onClick={onClose}
      />

      <div
        className="tracking-panel relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-12px_50px_rgba(17,24,39,0.18)] sm:max-w-lg sm:rounded-[1.75rem] sm:shadow-[0_24px_70px_rgba(17,24,39,0.22)]"
        data-lenis-prevent
      >
        <span
          aria-hidden="true"
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-gray-200 sm:hidden"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-7 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 sm:top-4"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span id="order-tracking-title" className="sr-only">
            Track Order {orderNumber}
          </span>

          {loading && !order ? (
            <LoaderBlock className="py-16" />
          ) : (
            <OrderTracking order={order} embedded />
          )}

          {loading && order ? (
            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
              Refreshing status…
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
