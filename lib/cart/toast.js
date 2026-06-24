'use client';

import { CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';

const TOAST_DURATION = 3000;

const CART_TOAST_WRAPPER_CLASS =
  '!bg-transparent !border-0 !p-0 !shadow-none !mx-auto !w-fit !max-w-[min(calc(100vw-2rem),24rem)]';

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
        className="flex w-full min-w-0 flex-row items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-[0_12px_40px_rgba(17,24,39,0.15)] sm:gap-4 sm:px-4 sm:py-3"
      >
        <p className="min-w-0 shrink text-pretty text-sm font-semibold leading-snug text-gray-950">
          Item added to cart
        </p>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(id);
            goToCart(router);
          }}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-950 px-3 py-2 text-xs font-semibold uppercase text-white transition hover:bg-gray-800 sm:px-4 sm:py-2"
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

const OFFER_TOAST_WRAPPER_CLASS =
  '!bg-transparent !border-0 !p-0 !shadow-none !w-full !max-w-[min(100vw-2rem,24rem)]';

export function showBuyTwoGetOneOfferToast(message) {
  if (!message) return;

  toast.custom(
    () => (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-[0_12px_40px_rgba(17,24,39,0.15)]"
      >
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-pretty leading-snug">{message}</p>
      </div>
    ),
    {
      duration: TOAST_DURATION,
      unstyled: true,
      classNames: {
        toast: OFFER_TOAST_WRAPPER_CLASS,
      },
    },
  );
}
