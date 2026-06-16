'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CartBag from '@/components/cart/CartBag';
import ScratchCardOffer, { getStoredScratchCoupon } from '@/components/cart/ScratchCardOffer';
import { formatInr } from '@/lib/cart/format';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';

export default function CartCheckout() {
  const router = useRouter();
  const [scratchCoupon, setScratchCoupon] = useState(() => getStoredScratchCoupon());
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore((state) => state.itemCount);

  const visibleTotal = total || items.reduce((sum, item) => sum + (item.subtotal ?? item.price * item.quantity), 0);
  const visibleCount = itemCount || items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;
  const deliveryFee = hasItems ? 15 : 0;
  const discount = items.reduce((sum, item) => {
    const originalLineTotal = item.originalPrice > item.price ? item.originalPrice * item.quantity : item.price * item.quantity;
    const currentLineTotal = item.subtotal ?? item.price * item.quantity;
    return sum + Math.max(0, originalLineTotal - currentLineTotal);
  }, 0);
  const subtotalBeforeDiscount = visibleTotal + discount;
  const payableTotal = Math.max(0, visibleTotal + deliveryFee);

  const handleCheckout = () => {
    if (!hasItems) return;
    router.push(APP_ROUTES.PAYMENT_METHOD);
  };

  return (
    <div>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-4 sm:py-6 lg:h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-4 lg:overflow-hidden">
        <div className="min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2" data-lenis-prevent>
          <CartBag />
        </div>

        <aside className="h-fit rounded-[1.15rem] border border-gray-200 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.09)] lg:sticky lg:top-24">
          {hasItems ? (
            <div className="mb-4">
              <ScratchCardOffer
                initialCoupon={scratchCoupon}
                onCouponChange={setScratchCoupon}
                compact
              />
            </div>
          ) : null}

          <h2 className="text-sm font-extrabold text-gray-950">Order Summary</h2>

          <div className="mt-4 space-y-2.5 border-b border-gray-200 pb-3 text-xs font-semibold">
            <div className="flex items-center justify-between text-gray-500">
              <span>
                Subtotal ({visibleCount} {visibleCount === 1 ? 'item' : 'items'})
              </span>
              <span className="text-gray-950">{formatInr(subtotalBeforeDiscount)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Discount</span>
              <span className="text-red-500">-{formatInr(discount)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span className="text-gray-950">{formatInr(deliveryFee)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-base font-extrabold text-gray-950">
            <span>Total</span>
            <span>{formatInr(payableTotal)}</span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={!hasItems}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-4 text-xs font-bold text-white shadow-[0_10px_22px_rgba(17,24,39,0.16)] transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            Go to Checkout
            <span aria-hidden="true">-&gt;</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
