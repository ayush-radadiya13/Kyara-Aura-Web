'use client';

import CheckoutSteps from '@/components/cart/CheckoutSteps';
import CartBag from '@/components/cart/CartBag';
import CartLoginPanel from '@/components/cart/CartLoginPanel';

/**
 * @param {{ fieldKeys: string[] }} props
 */
export default function CartCheckout({ fieldKeys }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-10 sm:mb-14">
        <CheckoutSteps activeStep={1} />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <CartBag />
        <CartLoginPanel fieldKeys={fieldKeys} />
      </div>
    </div>
  );
}
