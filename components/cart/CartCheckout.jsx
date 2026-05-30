'use client';

import CheckoutSteps from '@/components/cart/CheckoutSteps';
import CartBag from '@/components/cart/CartBag';
import CartLoginPanel from '@/components/cart/CartLoginPanel';
import { useAuthStore } from '@/store/auth-store';

/**
 * @param {{ fieldKeys: string[] }} props
 */
export default function CartCheckout({ fieldKeys }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const showLoginPanel = isHydrated && !isAuthenticated;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-10 sm:mb-14">
        <CheckoutSteps activeStep={1} />
      </div>

      <div className={`grid grid-cols-1 gap-10 ${showLoginPanel ? 'lg:grid-cols-2 lg:gap-12 lg:items-start' : ''}`}>
        <CartBag />
        {showLoginPanel && <CartLoginPanel fieldKeys={fieldKeys} />}
      </div>
    </div>
  );
}
