'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CartBag from '@/components/cart/CartBag';
import OrderSummary from '@/components/cart/OrderSummary';
import ScratchCardOffer from '@/components/cart/ScratchCardOffer';
import { buildCartOrderSummary } from '@/lib/cart/order-summary';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';

export default function CartCheckout() {
  const router = useRouter();
  const [scratchCoupon, setScratchCoupon] = useState(null);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore((state) => state.itemCount);
  const buyTwoGetOneDiscountAmount = useCartStore((state) => state.buyTwoGetOneDiscountAmount);
  const orderSummaryFromStore = useCartStore((state) => state.orderSummary);

  const hasItems = items.length > 0;
  const summary = hasItems
    ? buildCartOrderSummary({
        items,
        total,
        itemCount,
        buyTwoGetOneDiscountAmount,
        orderSummary: orderSummaryFromStore,
      })
    : null;

  const handleCheckout = () => {
    if (!hasItems) return;
    router.push(APP_ROUTES.PAYMENT_METHOD);
  };

  if (!hasItems) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:py-6">
        <CartBag />
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-4">
        <div>
          <CartBag />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="shrink-0 rounded-[1.15rem]">
            <ScratchCardOffer
              initialCoupon={scratchCoupon}
              onCouponChange={setScratchCoupon}
              compact
            />
          </div>

          <OrderSummary summary={summary} compact />

          <button
            type="button"
            onClick={handleCheckout}
            className="hidden h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gray-950 px-4 text-xs font-bold text-white transition hover:bg-gray-800 lg:flex"
          >
            Go to Checkout
            <span aria-hidden="true">-&gt;</span>
          </button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={handleCheckout}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-4 text-sm font-extrabold text-white transition hover:bg-gray-800"
          >
            Go to Checkout
            <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
