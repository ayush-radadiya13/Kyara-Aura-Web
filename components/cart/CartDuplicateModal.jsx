'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { CART_DUPLICATE_MESSAGE } from '@/lib/cart/duplicate';
import { APP_ROUTES } from '@/lib/routes';

export default function CartDuplicateModal({ open, onClose }) {
  const router = useRouter();
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

  const handleGoToCart = () => {
    onClose();
    router.push(APP_ROUTES.CART);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-duplicate-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl" data-lenis-prevent>
        <p id="cart-duplicate-modal-title" className="text-center text-base font-semibold text-gray-900">
          {CART_DUPLICATE_MESSAGE}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleGoToCart}
            className="flex-1 bg-gray-950 px-4 py-3 text-sm font-semibold uppercase text-white transition hover:bg-gray-800"
          >
            Go to Cart
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-950 bg-white px-4 py-3 text-sm font-semibold uppercase text-gray-950 transition hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
