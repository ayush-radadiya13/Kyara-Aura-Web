'use client';

import { useRouter } from 'next/navigation';
import CartBag from '@/components/cart/CartBag';
import { buildCartOrderSummary } from '@/lib/cart/order-summary';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';

function CheckoutButtonIcon() {
  return (
    <div className="cart-checkout-arrow shrink-0" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function GoToCheckoutButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-full shrink-0 items-center justify-center gap-3 overflow-visible rounded-full bg-gray-950 px-4 text-xs font-bold text-white transition hover:bg-gray-800 sm:text-sm lg:w-auto lg:px-6 ${className}`}
    >
      Go to Checkout
      <CheckoutButtonIcon />
    </button>
  );
}

export default function CartCheckout() {
  const router = useRouter();
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
      <div className="mx-auto w-full max-w-4xl bg-white px-4 py-4 sm:py-6">
        <CartBag />
      </div>
    );
  }

  const checkoutSlot = <GoToCheckoutButton onClick={handleCheckout} />;

  return (
    <div className="pb-28 lg:pb-6">
      <div className="mx-auto w-full max-w-7xl  px-4 py-4 sm:py-6">
        <CartBag checkoutSlot={checkoutSlot} itemsSubtotal={summary.itemsSubtotal} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <GoToCheckoutButton onClick={handleCheckout} />
        </div>
      </div>
    </div>
  );
}
