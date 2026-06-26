'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCartApi, removeCartItemApi, updateCartQuantityApi } from '@/services/cart';
import { Loader, LoaderBlock } from '@/components/ui/loader';
import { formatInr } from '@/lib/cart/format';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';
import { useScrollLock } from '@/hooks/use-scroll-lock';

export default function CartDrawer({ open, onClose, isLoading = false, error = '' }) {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore((state) => state.itemCount);
  const setCart = useCartStore((state) => state.setCart);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [actionError, setActionError] = useState('');
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-popup-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close bag"
        onClick={onClose}
      />

      <aside className="relative z-[1] flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-6">
          <h2 id="cart-popup-title" className="flex items-center gap-2 text-lg font-bold text-gray-950">
            <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
            Your Bag
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

        <div className="flex-1 overflow-y-auto px-4" data-lenis-prevent>
          {isLoading && items.length === 0 ? (
            <LoaderBlock className="py-8" />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Image
                src="/assets/empty-cart.png"
                alt="Your bag is empty"
                width={180}
                height={180}
                className="h-auto w-32 max-w-[45vw] sm:w-40"
              />
              <h2 className="mt-5 text-xl font-bold text-gray-950 sm:text-2xl">Your bag is empty.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
                Browse our collection and add your favorite pieces to your bag.
              </p>
              <Link
                href={APP_ROUTES.PRODUCTS}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg border border-gray-950 bg-transparent px-8 text-sm font-semibold text-gray-950 transition hover:bg-gray-950 hover:text-white"
                onClick={onClose}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const lineTotal = item.subtotal ?? item.price * item.quantity;
                const disabled = updatingItemId === item.id;

                return (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-gray-100">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 text-base font-bold leading-tight text-gray-950">
                          {item.title}
                        </p>
                        <button
                          type="button"
                          className="mt-1 shrink-0 text-gray-600 hover:text-gray-950 disabled:opacity-50"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => handleRemove(item)}
                          disabled={disabled}
                        >
                          {disabled ? (
                            <Loader size="sm" className="h-4 w-4 border-current border-t-transparent" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <p className="mt-1 text-base font-semibold text-gray-950">
                        Size: {item.sizeLabel || item.size}
                        <br />
                        Qty: {item.quantity}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-950">{formatInr(lineTotal)}</p>

                      <div className="mt-3 flex items-center gap-4 text-lg font-semibold text-gray-950">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-[#A97818] disabled:cursor-not-allowed disabled:bg-gray-300"
                          aria-label="Decrease quantity"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={disabled || item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.4} />
                        </button>
                        <span className="flex min-w-4 justify-center text-center text-base font-semibold">
                          {disabled ? (
                            <Loader size="sm" className="h-4 w-4 border-gray-950 border-t-transparent" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-[#A97818] disabled:cursor-not-allowed disabled:bg-gray-300"
                          aria-label="Increase quantity"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={disabled}
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
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
          <div className="mb-3 flex items-center justify-between text-base font-bold text-gray-950">
            <span>Subtotal: ({visibleCount} {visibleCount === 1 ? 'item' : 'items'})</span>
            <span>{formatInr(visibleTotal)}</span>
          </div>

          <div className="flex gap-3">
            <Link
              href={APP_ROUTES.CART}
              onClick={onClose}
              className="block w-full border border-gray-950 py-2.5 text-center text-base font-bold text-gray-950 transition-colors hover:bg-gray-950 hover:text-white"
            >
              View Bag
            </Link>
            <Link
              href={APP_ROUTES.PAYMENT_METHOD}
              onClick={onClose}
              className="block w-full bg-gray-950 py-3 text-center text-base font-bold text-white transition-colors hover:bg-gray-800"
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
