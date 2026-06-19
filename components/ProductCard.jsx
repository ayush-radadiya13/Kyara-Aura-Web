'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import CartDrawer from '@/components/cart/CartDrawer';
import CartDuplicateModal from '@/components/cart/CartDuplicateModal';
import WishlistButton from '@/components/WishlistButton';
import { Loader, LoadingLabel } from '@/components/ui/loader';
import {
  hasCartItemWithProductSize,
  isDuplicateCartError,
} from '@/lib/cart/duplicate';
import { useCartStore } from '@/lib/cart/store';
import { addCartItemApi, getCartApi } from '@/services/cart';

function imageUrlFromValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.image_url || value.image_path || '';
}

function getProductImageSrc(product) {
  const imageSources = [product.images, product.image, product.product_images, product.productImages];
  const imageList = imageSources.find((source) => Array.isArray(source) && source.length);
  const primaryImage = imageList?.find((image) => image?.is_primary) ?? imageList?.[0];

  return (
    imageUrlFromValue(primaryImage) ||
    imageUrlFromValue(product.image) ||
    product.image_url ||
    product.image_path ||
    ''
  );
}

function getQuickAddSize(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  return sizes.find((size) => size.id && size.quantity !== 0) ?? sizes.find((size) => size.id);
}

export default function ProductCard({
  product,
  variant = 'default',
  wishlistActive = false,
  wishlistItemId,
  onWishlistClick,
  wishlistBusy = false,
}) {
  const setCart = useCartStore((state) => state.setCart);
  const cartItems = useCartStore((state) => state.items);
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [duplicateCartModalOpen, setDuplicateCartModalOpen] = useState(false);
  const href = `/products/${product.slug}`;
  const originalPrice = product.oldPrice ?? product.originalPrice;
  const discountPercent =
    product.discount ??
    (originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0);
  const productImageSrc = getProductImageSrc(product);
  const productId = product.id ?? product._id;
  const wishlistLabel = wishlistActive ? 'Remove from wishlist' : 'Add to wishlist';
  const quickAddSize = getQuickAddSize(product);

  const showDuplicateCartModal = () => {
    setDuplicateCartModalOpen(true);
  };

  const handleQuickAddToBag = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!quickAddSize?.id) {
      setCartError('Please select a size on the product page before adding this item.');
      setBagDrawerOpen(true);
      return;
    }

    if (hasCartItemWithProductSize(cartItems, quickAddSize.id)) {
      setCartError('');
      showDuplicateCartModal();
      return;
    }

    setCartError('');
    setCartLoading(true);
    setBagDrawerOpen(true);

    try {
      await addCartItemApi({
        product_size_id: quickAddSize.id,
        quantity: 1,
      });
      const cart = await getCartApi();
      setCart(cart);
    } catch (error) {
      if (isDuplicateCartError(error)) {
        setBagDrawerOpen(false);
        showDuplicateCartModal();
        return;
      }

      setCartError(error?.response?.data?.message || error?.message || 'Unable to add this product to your bag.');
    } finally {
      setCartLoading(false);
    }
  };

  const renderWishlistButton = (className) => {
    if (onWishlistClick) {
      return (
        <button
          type="button"
          aria-label={wishlistLabel}
          title={wishlistLabel}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onWishlistClick(product);
          }}
          disabled={wishlistBusy}
          className={className}
        >
          {wishlistBusy ? (
            <Loader size="sm" className="h-4 w-4 border-current border-t-transparent" />
          ) : (
            <Heart
              className="h-4 w-4"
              fill={wishlistActive ? 'currentColor' : 'none'}
              strokeWidth={1.8}
            />
          )}
        </button>
      );
    }

    return (
      <WishlistButton
        productId={productId}
        wishlistItemId={wishlistItemId}
        initialActive={wishlistActive}
        className={className}
      />
    );
  };

  if (variant === 'editorial' || variant === 'catalog') {
    const isCatalog = variant === 'catalog';

    return (
      <>
      <div className="group relative block">
        <div className="relative aspect-[10/11] overflow-hidden bg-[#faf9f7] sm:aspect-square">
          <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
          <div className="absolute right-5 top-5 z-20 flex flex-col gap-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
            {renderWishlistButton(
              'flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60',
            )}
          </div>

          <div className="relative flex h-full w-full items-center justify-center">
            {productImageSrc ? (
              <Image
                src={productImageSrc}
                alt={product.name}
                fill
                className="object-contain transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              />
            ) : (
              <span className="text-xs text-gray-400">No image</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAddToBag}
            disabled={cartLoading}
            className={`${isCatalog ? 'inset-x-5 bottom-5 bg-white py-2 text-gray-950 shadow-sm' : 'inset-x-0 bottom-0 bg-gray-950 py-4 text-white'} absolute z-20 translate-y-full text-sm font-semibold uppercase  transition duration-300 group-hover:translate-y-0`}
          >
            {cartLoading ? (
              <LoadingLabel spinnerClassName={isCatalog ? 'border-gray-950 border-t-transparent' : 'border-white border-t-transparent'}>
                Adding...
              </LoadingLabel>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>

        <div className={isCatalog ? 'pt-4' : 'pt-5'}>
          <h3 className={`${isCatalog ? 'text-[15px]' : 'text-md'} font-semibold text-gray-950 transition group-hover:text-gray-600`}>
            <Link href={href}>{product.name}</Link>
          </h3>
          <div className={`${isCatalog ? 'mt-2 text-[13px]' : 'mt-2 text-md'} flex flex-wrap items-center gap-2`}>
            <p className="font-medium text-gray-700">₹{product.price?.toLocaleString('en-IN')}</p>
            {originalPrice && originalPrice > product.price && (
              <p className="text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
            )}
            {discountPercent > 0 && (
              <span className="rounded-full border border-[#d3b987]/40 bg-[#fff8ea] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#9a6a1f]">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
      <CartDrawer
        open={bagDrawerOpen}
        onClose={() => setBagDrawerOpen(false)}
        isLoading={cartLoading}
        error={cartError}
      />
      <CartDuplicateModal
        open={duplicateCartModalOpen}
        onClose={() => setDuplicateCartModalOpen(false)}
      />
      </>
    );
  }

  return (
    <>
    <div className="group block rounded-lg glass-card overflow-hidden hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-[1.02]">
      <div
        className="relative w-full h-44 sm:h-48 md:h-52 lg:h-56 p-2 sm:p-3 bg-gradient-to-b from-gray-50 via-gray-100 to-white shadow-[inset_0_0_32px_rgba(0,0,0,0.05)]"
      >
        <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
        <div className="relative z-0 flex h-full w-full items-center justify-center">
          {productImageSrc ? (
            <Image
              src={productImageSrc}
              alt={product.name}
              fill
              className="object-contain object-center p-0.5 group-hover:scale-[1.03] transition duration-500"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            />
          ) : (
            <span className="relative z-0 text-gray-400 text-xs">No image</span>
          )}
        </div>
        <div className="absolute top-1 right-1 z-20">
          {renderWishlistButton(
            'flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60',
          )}
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gold/90 uppercase tracking-wider leading-tight">{product.category?.name}</p>
        <h3 className="font-display text-xs sm:text-sm md:text-base mt-0.5 text-gray-900 group-hover:text-gold transition-colors duration-200 line-clamp-2 leading-snug">{product.name}</h3>
        
        {/* Price Section */}
        <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="text-sm font-semibold text-gold">₹{product.price?.toLocaleString('en-IN')}</p>
            {originalPrice && originalPrice > product.price && (
              <p className="text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
            )}
            {discountPercent > 0 && (
              <span className="rounded-full border border-gold/30 bg-gradient-to-r from-amber-50 to-orange-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-sm sm:px-2 sm:text-[11px]">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Add to Bag Button */}
        <button
          type="button"
          onClick={handleQuickAddToBag}
          disabled={cartLoading}
          className="mt-2 sm:mt-3 w-full btn-gold py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] transition-transform disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cartLoading ? (
            <>
              <LoadingLabel className="hidden sm:inline-flex" spinnerClassName="border-white border-t-transparent">
                Adding...
              </LoadingLabel>
              <LoadingLabel className="sm:hidden" spinnerClassName="border-white border-t-transparent">
                Adding
              </LoadingLabel>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add to Bag</span>
              <span className="sm:hidden">Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
    <CartDrawer
      open={bagDrawerOpen}
      onClose={() => setBagDrawerOpen(false)}
      isLoading={cartLoading}
      error={cartError}
    />
    <CartDuplicateModal
      open={duplicateCartModalOpen}
      onClose={() => setDuplicateCartModalOpen(false)}
    />
    </>
  );
}
