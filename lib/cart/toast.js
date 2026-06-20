'use client';

import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';

const TOAST_DURATION = 3000;

const CART_TOAST_WRAPPER_CLASS =
  '!bg-transparent !border-0 !p-0 !shadow-none !w-auto !max-w-none';

function goToCart(router) {
  if (router?.push) {
    router.push(APP_ROUTES.CART);
    return;
  }

  window.location.assign(APP_ROUTES.CART);
}

export function showItemAddedToCartToast(router) {
  toast.custom(
    (id) => (
      <div
        role="status"
        aria-live="polite"
        className="flex w-auto min-w-[min(100vw-2rem,24rem)] items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(17,24,39,0.15)]"
      >
        <p className="text-sm font-semibold text-gray-950">Item added to cart</p>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(id);
            goToCart(router);
          }}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold uppercase text-white transition hover:bg-gray-800"
        >
          Go to Cart
        </button>
      </div>
    ),
    {
      duration: TOAST_DURATION,
      unstyled: true,
      classNames: {
        toast: CART_TOAST_WRAPPER_CLASS,
      },
    },
  );
}

export function showBuyTwoGetOneOfferToast(message) {
  if (!message) return;

  toast(message, {
    duration: TOAST_DURATION,
  });
}
