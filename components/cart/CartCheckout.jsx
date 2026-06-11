'use client';

import { useRouter } from 'next/navigation';
import CartBag from '@/components/cart/CartBag';
import { formatInr } from '@/lib/cart/format';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';

export default function CartCheckout() {
  const router = useRouter();
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
    <div className="bg-[#f7f7f5]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-8">
        <CartBag />

        <aside className="rounded-[1.8rem] border border-gray-200 bg-white p-5 shadow-[0_22px_60px_rgba(17,24,39,0.12)] sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-extrabold text-gray-950">Order Summary</h2>

          <div className="mt-4 flex h-11 items-center gap-3">
            <label className="sr-only" htmlFor="coupon-code">
              Coupon Code
            </label>
            <input
              id="coupon-code"
              type="text"
              placeholder="Coupon Code"
              className="h-full min-w-0 flex-1 rounded-full bg-gray-50 px-4 text-sm font-semibold text-gray-700 outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              className="h-full rounded-full bg-gray-950 px-6 text-xs font-bold text-white transition hover:bg-gray-800"
            >
              Apply
            </button>
          </div>

          <div className="mt-5 space-y-4 border-b border-gray-200 pb-5 text-sm font-semibold">
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

          <div className="mt-5 flex items-center justify-between text-lg font-extrabold text-gray-950">
            <span>Total</span>
            <span>{formatInr(payableTotal)}</span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={!hasItems}
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-gray-950 px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(17,24,39,0.2)] transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            Go to Checkout
            <span aria-hidden="true">-&gt;</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
