'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import CartDrawer from '@/components/cart/CartDrawer';
import { Loader, LoadingLabel } from '@/components/ui/loader';
import {
  hasCartItemWithProductSize,
  isDuplicateCartError,
} from '@/lib/cart/duplicate';
import { useCartStore } from '@/lib/cart/store';
import { showItemAddedToCartToast } from '@/lib/cart/toast';
import { APP_ROUTES } from '@/lib/routes';
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
  const router = useRouter();
  const setCart = useCartStore((state) => state.setCart);
  const cartItems = useCartStore((state) => state.items);
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const href = `/products/${product.slug}`;
  const originalPrice = product.oldPrice ?? product.originalPrice;
  const discountPercent =
    product.discount ??
    (originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0);
  const productImageSrc = getProductImageSrc(product);
  const wishlistLabel = wishlistActive ? 'Remove from wishlist' : 'Add to wishlist';
  const quickAddSize = getQuickAddSize(product);
  const isInCart = hasCartItemWithProductSize(cartItems, quickAddSize?.id);

  const goToCart = () => {
    router.push(APP_ROUTES.CART);
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
      goToCart();
      return;
    }

    setCartError('');
    setCartLoading(true);

    try {
      await addCartItemApi({
        product_size_id: quickAddSize.id,
        quantity: 1,
      });
      const cart = await getCartApi();
      setCart(cart);
      showItemAddedToCartToast(router);
    } catch (error) {
      if (isDuplicateCartError(error)) {
        const cart = await getCartApi();
        setCart(cart);
        goToCart();
        return;
      }

      setCartError(error?.response?.data?.message || error?.message || 'Unable to add this product to your bag.');
      setBagDrawerOpen(true);
    } finally {
      setCartLoading(false);
    }
  };

  const renderWishlistButton = (className) => {
    if (!onWishlistClick) return null;

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
  };

  const renderBagButton = (className) => (
    <button
      type="button"
      onClick={handleQuickAddToBag}
      disabled={cartLoading}
      aria-label={isInCart ? 'Go to cart' : 'Add to bag'}
      title={isInCart ? 'Go to cart' : 'Add to bag'}
      className={className}
    >
      {cartLoading ? (
        <Loader size="sm" className="h-4 w-4 border-gray-900 border-t-transparent" />
      ) : (
        <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
      )}
    </button>
  );

  if (variant === 'editorial' || variant === 'catalog') {
    const isCatalog = variant === 'catalog';

    return (
      <>
      <div className="group relative block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#faf9f7] sm:aspect-square">
          <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
          {onWishlistClick ? (
            <div className="absolute right-3 top-3 z-20">
              {renderWishlistButton(
                'flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60',
              )}
            </div>
          ) : null}

          <div className="relative flex h-full w-full items-center justify-center">
            {productImageSrc ? (
              <Image
                src={productImageSrc}
                alt={product.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 25vw"
              />
            ) : (
              <span className="text-xs text-gray-400">No image</span>
            )}
          </div>

          {renderBagButton(
            'absolute bottom-2 right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 shadow-md transition hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:hidden',
          )}

          <button
            type="button"
            onClick={handleQuickAddToBag}
            disabled={cartLoading}
            className={`${isCatalog ? 'inset-x-5 bottom-5 bg-white py-1 text-gray-950 shadow-sm' : 'inset-x-0 bottom-0 bg-gray-950 py-2 text-white'} absolute z-20 hidden translate-y-full text-sm font-semibold uppercase transition duration-300 group-hover:translate-y-0 sm:block`}
          >
            {cartLoading ? (
              <LoadingLabel spinnerClassName={isCatalog ? 'border-gray-950 border-t-transparent' : 'border-white border-t-transparent'}>
                Adding...
              </LoadingLabel>
            ) : isInCart ? (
              'Go to Cart'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>

        <div className={isCatalog ? 'pt-2' : 'pt-2.5'}>
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-950 transition group-hover:text-gray-600 sm:text-[15px]">
            <Link href={href}>{product.name}</Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm sm:mt-2 sm:gap-2">
            <p className="font-semibold text-gray-950">₹{product.price?.toLocaleString('en-IN')}</p>
            {originalPrice && originalPrice > product.price && (
              <p className="text-xs text-gray-400 line-through sm:text-sm">
                ₹{originalPrice.toLocaleString('en-IN')}
              </p>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-medium text-blue-600 sm:text-sm">
                {discountPercent}% off
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
      </>
    );
  }

  return (
    <>
    <div className="group block rounded-lg glass-card overflow-hidden hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-[1.02]">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 via-gray-100 to-white shadow-[inset_0_0_32px_rgba(0,0,0,0.05)] sm:h-48 sm:aspect-auto md:h-52 lg:h-56">
        <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
        <div className="relative z-0 flex h-full w-full items-center justify-center p-2 sm:p-3">
          {productImageSrc ? (
            <Image
              src={productImageSrc}
              alt={product.name}
              fill
              className="object-cover object-center p-0.5 transition duration-500 group-hover:scale-[1.03] sm:object-contain"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            />
          ) : (
            <span className="relative z-0 text-xs text-gray-400">No image</span>
          )}
        </div>
        {onWishlistClick ? (
          <div className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
            {renderWishlistButton(
              'flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          </div>
        ) : null}
        {renderBagButton(
          'absolute bottom-2 right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 shadow-md transition hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:hidden',
        )}
      </div>
      <div className="p-2 sm:p-3">
        <p className="hidden text-[9px] uppercase leading-tight tracking-wider text-gold/90 sm:block sm:text-[10px] md:text-[11px]">
          {product.category?.name}
        </p>
        <h3 className="mt-0.5 line-clamp-1 font-display text-sm font-semibold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-gold sm:line-clamp-2 sm:text-base">
          {product.name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
          <p className="text-sm font-semibold text-gray-950 sm:text-gold">
            ₹{product.price?.toLocaleString('en-IN')}
          </p>
          {originalPrice && originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through sm:text-gray-500">
              ₹{originalPrice.toLocaleString('en-IN')}
            </p>
          )}
          {discountPercent > 0 && (
            <span className="text-xs font-medium text-blue-600 sm:rounded-full sm:border sm:border-gold/30 sm:bg-gradient-to-r sm:from-amber-50 sm:to-orange-50 sm:px-2 sm:py-0.5 sm:text-[11px] sm:font-bold sm:uppercase sm:tracking-wide sm:text-amber-700">
              {discountPercent}% off
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleQuickAddToBag}
          disabled={cartLoading}
          className="btn-gold mt-2 hidden w-full items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-3 sm:flex sm:gap-2 sm:py-2 sm:text-sm"
        >
          {cartLoading ? (
            <LoadingLabel spinnerClassName="border-white border-t-transparent">Adding...</LoadingLabel>
          ) : isInCart ? (
            <>
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Go to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add to Bag</span>
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
    </>
  );
}
