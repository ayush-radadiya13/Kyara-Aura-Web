'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAddWishlistItem, useDeleteWishlistItem } from '@/hooks/use-wishlist';
import { AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';

export default function WishlistButton({
  productId,
  wishlistItemId,
  initialActive = false,
  onChanged,
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const addWishlistItem = useAddWishlistItem();
  const deleteWishlistItem = useDeleteWishlistItem();
  const [active, setActive] = useState(initialActive);
  const [activeWishlistItemId, setActiveWishlistItemId] = useState(wishlistItemId);
  const [animating, setAnimating] = useState(false);
  const busy = addWishlistItem.isPending || deleteWishlistItem.isPending;

  function redirectToLogin() {
    const queryString = searchParams.toString();
    const from = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.push(withRedirect(AUTH_PAGE_ROUTES.LOGIN, from));
  }

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isHydrated) return;
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (!productId) return;

    setAnimating(true);

    try {
      if (active && activeWishlistItemId) {
        await deleteWishlistItem.mutateAsync(activeWishlistItemId);
        setActive(false);
        setActiveWishlistItemId(undefined);
        onChanged?.({ active: false, productId, wishlistItemId: activeWishlistItemId });
        return;
      }

      const response = await addWishlistItem.mutateAsync(productId);
      const nextWishlistItemId =
        response?.data?.id ??
        response?.data?._id ??
        response?.id ??
        response?._id ??
        activeWishlistItemId;

      setActive(true);
      setActiveWishlistItemId(nextWishlistItemId);
      onChanged?.({ active: true, productId, wishlistItemId: nextWishlistItemId });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAnimating(false), 320);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`
        flex h-10 w-10 items-center justify-center rounded-full text-lg
        backdrop-blur-xl bg-gray-50/80 border border-gray-200
        transition-all duration-200 hover:border-gold/40 hover:shadow-gold-glow-sm
        disabled:opacity-60
        ${active ? 'text-red-500 border-red-300' : 'text-gray-600'}
        ${animating ? 'scale-125' : 'scale-100'}
        ${className}
      `}
    >
      <Heart
        className={`h-5 w-5 transition-transform duration-200 ${animating ? 'scale-110' : ''}`}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={1.8}
        aria-hidden
      />
    </button>
  );
}
