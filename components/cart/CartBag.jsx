'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart/store';
import { formatInr } from '@/lib/cart/format';
import { clearCartApi, getCartApi } from '@/services/cart';

export default function CartBag() {
  const items = useCartStore((state) => state.items);
  const setCart = useCartStore((state) => state.setCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadCart() {
      setIsLoading(true);
      setLoadError('');
      try {
        const cart = await getCartApi();
        if (isCurrent) setCart(cart);
      } catch (error) {
        if (isCurrent) {
          setLoadError(error?.response?.data?.message || error?.message || 'Unable to load your bag.');
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadCart();

    return () => {
      isCurrent = false;
    };
  }, [setCart]);

  const handleClearCart = async () => {
    setActionError('');
    setIsClearing(true);

    try {
      await clearCartApi();
      clearCart();
    } catch (error) {
      setActionError(error?.response?.data?.message || error?.message || 'Unable to clear your bag.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <section aria-labelledby="cart-bag-heading" className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h2 id="cart-bag-heading" className="text-xl font-bold text-gray-900">
          Bag
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={isClearing}
            className="text-sm font-semibold text-gray-600 underline underline-offset-2 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClearing ? 'Clearing...' : 'Clear Cart'}
          </button>
        )}
      </div>
      <div className="mt-4 border-t border-gray-200" />

      {(loadError || actionError) && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError || actionError}
        </p>
      )}

      {isLoading && items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-600">Loading your bag...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-600">Your bag is empty.</p>
          <Link
            href="/products"
            className="mt-3 inline-block text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug text-gray-900">
                  {item.title}
                  {item.sizeLabel ? ` (${item.sizeLabel})` : ''}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Size: {item.sizeLabel || item.size}/ Qty: {item.quantity}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatInr(item.originalPrice)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-gray-900">
                    {formatInr(item.subtotal ?? item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
