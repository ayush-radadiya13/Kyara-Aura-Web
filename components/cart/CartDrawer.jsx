'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCartApi, removeCartItemApi, updateCartQuantityApi } from '@/services/cart';
import { formatInr } from '@/lib/cart/format';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';

export default function CartDrawer({ open, onClose, isLoading = false, error = '' }) {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore((state) => state.itemCount);
  const setCart = useCartStore((state) => state.setCart);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const refreshCart = async () => {
    const cart = await getCartApi();
    setCart(cart);
  };

  const runCartAction = async (itemId, action) => {
    setActionError('');
    setUpdatingItemId(itemId);
    try {
      await action();
      await refreshCart();
    } catch (cartError) {
      setActionError(cartError?.response?.data?.message || cartError?.message || 'Unable to update bag.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = (item, quantity) => {
    if (!item.productSizeId) return;

    runCartAction(item.id, () =>
      updateCartQuantityApi({
        product_size_id: item.productSizeId,
        quantity,
      }),
    );
  };

  const handleRemove = (item) => {
    const itemId = item.cartItemId ?? item.id;
    runCartAction(item.id, () => removeCartItemApi(itemId));
  };

  const visibleTotal = total || items.reduce((sum, item) => sum + (item.subtotal ?? item.price * item.quantity), 0);
  const visibleCount = itemCount || items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close bag"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-6">
          <h2 id="cart-drawer-title" className="text-lg font-bold text-gray-950">
            Bag
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 transition-colors hover:text-gray-950"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {(error || actionError) && (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error || actionError}
            </p>
          )}

          {isLoading && items.length === 0 ? (
            <p className="py-8 text-sm text-gray-600">Loading bag...</p>
          ) : items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-600">Your bag is empty.</p>
              <Link
                href={APP_ROUTES.PRODUCTS}
                className="mt-3 inline-block text-sm font-semibold text-gray-900 underline underline-offset-2"
                onClick={onClose}
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const lineTotal = item.subtotal ?? item.price * item.quantity;
                const disabled = updatingItemId === item.id;

                return (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-gray-100">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="58px" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 text-sm font-bold leading-tight text-gray-950">
                          {item.title}
                          {item.sizeLabel ? ` (${item.sizeLabel})` : ''}
                        </p>
                        <button
                          type="button"
                          className="mt-1 shrink-0 text-gray-600 hover:text-gray-950 disabled:opacity-50"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => handleRemove(item)}
                          disabled={disabled}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1 text-xs font-semibold text-gray-950">
                        Size: {item.sizeLabel || item.size} / Qty: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-950">{formatInr(lineTotal)}</p>

                      <div className="mt-3 inline-flex h-7 items-center border border-gray-950">
                        <button
                          type="button"
                          className="h-full px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Decrease quantity"
                          onClick={() => handleQuantityChange(item, Math.max(0, item.quantity - 1))}
                          disabled={disabled}
                        >
                          -
                        </button>
                        <span className="min-w-8 px-2 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="h-full px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Increase quantity"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={disabled}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-4">
          <div className="mb-3 flex items-center justify-between text-sm font-bold text-gray-950">
            <span>Subtotal: ({visibleCount} {visibleCount === 1 ? 'item' : 'items'})</span>
            <span>{formatInr(visibleTotal)}</span>
          </div>

          <Link
            href={APP_ROUTES.CART}
            onClick={onClose}
            className="mb-2 block w-full border border-[#4a2a24] py-2.5 text-center text-sm font-bold text-[#4a2a24] transition-colors hover:bg-[#4a2a24] hover:text-white"
          >
            View Bag
          </Link>
          <Link
            href={APP_ROUTES.CART}
            onClick={onClose}
            className="block w-full bg-[#4a2a24] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#3a201c]"
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
