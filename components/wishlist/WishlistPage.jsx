'use client';

import Link from 'next/link';
import { Heart, ShieldCheck, ShoppingBag, Trash2, XCircle } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { LoaderBlock } from '@/components/ui/loader';
import {
  useClearWishlist,
  useDeleteWishlistItem,
  useWishlist,
} from '@/hooks/use-wishlist';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const wishlistQuery = useWishlist({
    enabled: isHydrated && isAuthenticated,
  });
  const deleteWishlistItem = useDeleteWishlistItem();
  const clearWishlist = useClearWishlist();

  const items = wishlistQuery.data ?? [];
  const isLoading = !isHydrated || (isAuthenticated && wishlistQuery.isLoading);
  const actionItemId = deleteWishlistItem.variables ?? null;
  const error =
    wishlistQuery.isError
      ? getApiErrorMessage(wishlistQuery.error, 'Unable to load your wishlist.')
      : deleteWishlistItem.isError
        ? getApiErrorMessage(deleteWishlistItem.error, 'Unable to remove this item.')
        : clearWishlist.isError
          ? getApiErrorMessage(clearWishlist.error, 'Unable to clear your wishlist.')
          : '';

  const handleRemove = async (item) => {
    if (!item?.wishlistItemId && !item?.id) return;
    try {
      await deleteWishlistItem.mutateAsync(item.wishlistItemId ?? item.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = async () => {
    if (!items.length) return;
    const confirmed = window.confirm('Clear all items from your wishlist?');
    if (!confirmed) return;

    try {
      await clearWishlist.mutateAsync();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <WishlistHero count={0} />
        <LoaderBlock className="py-12" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="    p-8 ">
          <ShieldCheck className="mx-auto h-12 w-12 text-[#4f3128]" />
          <h1 className="mt-5 text-3xl font-bold text-gray-950">Sign in to view your wishlist</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Your wishlist is saved to your account so you can revisit your favorite pieces anytime.
          </p>
          <Link
            href={withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.WISHLIST)}
            className="mt-7 inline-flex h-12 items-center justify-center bg-[#4f3128] px-7 text-sm font-bold text-white transition hover:bg-[#3d261f]"
          >
            Login to Continue
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <WishlistHero count={items.length} />

      {error ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {items.length ? (
        <>
          <div className="mb-10 flex flex-col gap-5 border-y border-gray-100 py-5 text-[14px] text-gray-800 lg:flex-row lg:items-center lg:justify-between">
            <p>
              Showing {items.length} wishlist {items.length === 1 ? 'item' : 'items'}.
            </p>
            <button
              type="button"
              onClick={handleClear}
              disabled={clearWishlist.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 self-start border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
            >
              <Trash2 className="h-4 w-4" />
              {clearWishlist.isPending ? 'Clearing...' : 'Clear Wishlist'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
            {items.map((item) => {
              const itemId = item.wishlistItemId ?? item.id;
              const isItemBusy =
                deleteWishlistItem.isPending &&
                String(actionItemId) === String(itemId);

              return (
                <article key={item.id} className="min-w-0">
                  <ProductCard
                    product={item.product}
                    variant="editorial"
                    wishlistActive
                    wishlistItemId={itemId}
                    wishlistBusy={isItemBusy}
                    onWishlistClick={() => handleRemove(item)}
                  />
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={isItemBusy}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 border border-red-100 px-3 text-xs font-bold uppercase tracking-wide text-red-700 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isItemBusy ? 'Working' : 'Remove'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyWishlist />
      )}
    </section>
  );
}

function WishlistHero({ count }) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">My account</p>
        <h1 className="mt-2 font-display text-4xl font-light text-gray-950 md:text-5xl">
          Wishlist
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
          Keep your favorite Kyara Aura pieces in one place and move them to your bag when you are ready.
        </p>
      </div>
      <div className="inline-flex items-center gap-3 self-start rounded-full border border-gray-100 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-[0_12px_30px_rgba(17,24,39,0.06)] lg:self-auto">
        <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
        {count} {count === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="      p-10 text-center ">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbfaf7] text-[#4f3128]">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-gray-950">Your wishlist is empty.</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
        Tap the heart on any product to save it here for later.
      </p>
      <Link
        href={APP_ROUTES.PRODUCTS}
        className="mt-7 inline-flex h-12 items-center justify-center bg-gray-950 px-7 text-sm font-bold text-white transition hover:bg-gray-800"
      >
        Explore Products
      </Link>
    </div>
  );
}
