'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Loader, LoaderBlock, LoadingLabel } from '@/components/ui/loader';
import { useCartStore } from '@/lib/cart/store';
import { formatInr } from '@/lib/cart/format';
import { APP_ROUTES } from '@/lib/routes';
import { clearCartApi, getCartApi, removeCartItemApi, updateCartQuantityApi } from '@/services/cart';

const CART_IMAGE_FALLBACK = '/images/product-placeholder.svg';

export default function CartBag() {
  const items = useCartStore((state) => state.items);
  const setCart = useCartStore((state) => state.setCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const selectionInitializedRef = useRef(false);

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

  useEffect(() => {
    setSelectedItemIds((currentIds) => {
      const itemIds = items.map((item) => item.id);

      if (!selectionInitializedRef.current) {
        selectionInitializedRef.current = true;
        return itemIds;
      }

      return currentIds.filter((id) => itemIds.includes(id));
    });
  }, [items]);

  const refreshCart = async () => {
    const cart = await getCartApi();
    setCart(cart);
  };

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

  const runCartAction = async (itemId, action) => {
    setActionError('');
    setUpdatingItemId(itemId);

    try {
      await action();
      await refreshCart();
    } catch (error) {
      setActionError(error?.response?.data?.message || error?.message || 'Unable to update your cart.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = (item, quantity) => {
    if (!item.productSizeId || quantity < 1) return;

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

  const handleDeleteSelected = async () => {
    const selectedItems = items.filter((item) => selectedItemIds.includes(item.id));
    if (!selectedItems.length) return;

    if (selectedItems.length === items.length) {
      await handleClearCart();
      return;
    }

    setActionError('');
    setIsClearing(true);

    try {
      await Promise.all(
        selectedItems.map((item) => removeCartItemApi(item.cartItemId ?? item.id)),
      );
      await refreshCart();
    } catch (error) {
      setActionError(error?.response?.data?.message || error?.message || 'Unable to delete selected items.');
    } finally {
      setIsClearing(false);
    }
  };

  const toggleSelectAll = () => {
    setSelectedItemIds((currentIds) => {
      if (currentIds.length === items.length) return [];
      return items.map((item) => item.id);
    });
  };

  const toggleSelectedItem = (itemId) => {
    setSelectedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId],
    );
  };

  const allSelected = items.length > 0 && selectedItemIds.length === items.length;

  return (
    <section aria-labelledby="cart-bag-heading" className="min-w-0">
      <h1 id="cart-bag-heading" className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
        Your cart
      </h1>

      {items.length > 0 && (
        <div className="mt-5 flex items-center justify-between rounded-[1.4rem] border border-gray-200 bg-white px-5 py-1 ">
          <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-gray-950">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-gray-950"
            />
            Select All
          </label>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={isClearing || selectedItemIds.length === 0}
            className="rounded-full bg-gray-950 px-6 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isClearing ? (
              <LoadingLabel spinnerClassName="border-white border-t-transparent">
                Deleting...
              </LoadingLabel>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      )}

      {(loadError || actionError) && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError || actionError}
        </p>
      )}

      {isLoading && items.length === 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-gray-200 bg-white py-12 text-center">
          <LoaderBlock className="py-0" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-gray-200 bg-white py-12 text-center shadow-[0_14px_40px_rgba(17,24,39,0.06)]">
          <p className="text-sm text-gray-600">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-3 inline-block rounded-full bg-gray-950 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 overflow-hidden rounded-[1.6rem] border border-gray-200 bg-white px-4 shadow-[0_18px_50px_rgba(17,24,39,0.07)] sm:px-6">
            {items.map((item, index) => {
              const lineTotal = item.subtotal ?? item.price * item.quantity;
              const disabled = updatingItemId === item.id || isClearing;
              const imageSrc = item.image || CART_IMAGE_FALLBACK;

              return (
                <li
                  key={item.id}
                  className={`grid grid-cols-[auto_72px_minmax(0,1fr)] items-center gap-4 py-5 sm:grid-cols-[auto_92px_minmax(0,1fr)_120px] ${
                    index === 0 ? '' : 'border-t border-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.title}`}
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => toggleSelectedItem(item.id)}
                    className="h-4 w-4 accent-gray-950"
                  />

                  <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-[92px]">
                    <Image
                      src={imageSrc}
                      alt={item.title}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 72px, 92px"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold leading-snug text-gray-950 sm:text-base">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-gray-700">
                          Size: {item.sizeLabel || item.size || 'Default'}
                          <br />
                      
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-full p-1 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => handleRemove(item)}
                        disabled={disabled}
                      >
                        {disabled ? (
                          <Loader size="sm" className="h-4 w-4 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <p className="mt-3 text-sm font-extrabold text-gray-950">{formatInr(lineTotal)}</p>
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                    <button
                      type="button"
                      className="hidden rounded-full p-1 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => handleRemove(item)}
                      disabled={disabled}
                    >
                      {disabled ? (
                        <Loader size="sm" className="h-4 w-4 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                    <div className="inline-flex h-9 items-center rounded-full bg-gray-50 px-3 text-gray-950">
                      <button
                        type="button"
                        className="px-2 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Decrease quantity"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={disabled || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="flex min-w-8 justify-center text-center text-sm font-bold">
                        {disabled ? (
                          <Loader size="sm" className="h-4 w-4 border-gray-950 border-t-transparent" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        type="button"
                        className="px-2 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40"
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

          <Link
            href={APP_ROUTES.PRODUCTS}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-gray-950 bg-white px-6 text-sm font-bold text-gray-950 transition hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </>
      )}
    </section>
  );
}
