'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { IndianRupee, Minus, Play, Plus, RefreshCcw, Share2, Truck } from 'lucide-react';
import Header from '../../../components/Header';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductList from '@/components/ProductList';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import ProductReviewForm from '@/components/ProductReviewForm';
import SizeChartModal from '@/components/SizeChartModal';
import WishlistButton from '@/components/WishlistButton';
import BuyTwoGetOneTicketBanner from '@/components/cart/BuyTwoGetOneTicketBanner';
import { DotLoaderBlock, LoadingLabel } from '@/components/ui/loader';
import { shouldShowQueryLoader } from '@/lib/query-loading';
import { getBuyTwoGetOneTicketMessage } from '@/lib/cart/buy-two-get-one';
import {
  hasCartItemWithProductSize,
  isDuplicateCartError,
} from '@/lib/cart/duplicate';
import { useCartStore } from '@/lib/cart/store';
import { showItemAddedToCartToast } from '@/lib/cart/toast';
import { APP_ROUTES } from '@/lib/routes';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useProductBySlug } from '@/hooks/use-products';
import { useWebSettings } from '@/hooks/use-web-settings';
import { addCartItemApi, getCartApi } from '@/services/cart';
import { sharePage } from '@/lib/share/web-share';
import {
  getBuyTwoGetOneQuantities,
  isBuyTwoGetOneFreeEnabled,
} from '@/lib/web-settings';

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

function imageUrlFromValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.image_url || value.image_path || value.video_url || value.url || '';
}

function isVideoUrl(src) {
  return typeof src === 'string' && VIDEO_EXTENSION_PATTERN.test(src);
}

const GALLERY_SIZE = 4;

function getProductImages(product) {
  const imageSources = [product?.images, product?.product_images, product?.productImages];
  const imageList = imageSources.find((source) => Array.isArray(source) && source.length);

  if (imageList?.length) {
    return [...imageList]
      .sort((first, second) => {
        if (typeof first === 'string' || typeof second === 'string') return 0;
        if (first?.is_primary && !second?.is_primary) return -1;
        if (!first?.is_primary && second?.is_primary) return 1;
        return Number(first?.sort_order ?? 0) - Number(second?.sort_order ?? 0);
      })
      .map(imageUrlFromValue)
      .filter(Boolean)
      // Guard against a video that the backend tucked into the images array;
      // never feed a video URL to next/image.
      .filter((src) => !isVideoUrl(src));
  }

  const singleImage = product?.image_url || product?.image_path;
  return singleImage && !isVideoUrl(singleImage) ? [singleImage] : [];
}

function videoUrlFromProduct(product) {
  const value = product?.video ?? product?.video_url ?? product?.videoUrl ?? '';
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const resolved = value.video_url || value.video_path || value.url || '';
    if (resolved) return resolved;
  }

  // Fall back to scanning the media arrays for a video that the backend may
  // have stored alongside the product images.
  const mediaSources = [product?.images, product?.product_images, product?.productImages];
  const mediaList = mediaSources.find((source) => Array.isArray(source) && source.length) ?? [];
  for (const item of mediaList) {
    const src = imageUrlFromValue(item);
    if (isVideoUrl(src)) return src;
  }

  return '';
}

function getProductMedia(product) {
  const imageItems = getProductImages(product).map((src) => ({ type: 'image', src }));
  const videoUrl = videoUrlFromProduct(product);
  const videoItem = videoUrl ? { type: 'video', src: videoUrl } : null;

  const media = videoItem ? [...imageItems, videoItem] : [...imageItems];

  if (!media.length) {
    return [{ type: 'image', src: '/images/product-1.png' }];
  }

  // Always render exactly GALLERY_SIZE tiles. When there are too few real
  // media items, repeat the available images to fill the grid (the video,
  // if present, always keeps a single slot).
  if (media.length < GALLERY_SIZE && imageItems.length) {
    const padded = [...media];
    let index = 0;
    while (padded.length < GALLERY_SIZE) {
      const source = imageItems[index % imageItems.length];
      padded.splice(videoItem ? padded.length - 1 : padded.length, 0, { ...source });
      index += 1;
    }
    return padded;
  }

  if (media.length > GALLERY_SIZE) {
    if (videoItem) {
      return [...imageItems.slice(0, GALLERY_SIZE - 1), videoItem];
    }
    return media.slice(0, GALLERY_SIZE);
  }

  return media;
}

function getDefaultSizeValue(sizeOptions) {
  if (!sizeOptions.length) return '';

  const inStock = sizeOptions.filter((option) => Number(option.quantity) > 0);
  const pool = inStock.length ? inStock : sizeOptions;
  const freeSize = pool.find((option) =>
    /^free\s*size$/i.test(String(option.label || option.value).trim()),
  );

  return freeSize?.value ?? pool[0]?.value ?? '';
}

function resolveQuantityForSize(quantity, selectedSizeOption) {
  if (!selectedSizeOption) {
    return quantity === null ? 1 : Number(quantity);
  }

  if (Number(selectedSizeOption.quantity) === 0) {
    return 0;
  }

  const quantityLimit = selectedSizeOption.quantity > 0 ? selectedSizeOption.quantity : null;
  const currentQty = quantity === null ? 1 : Number(quantity);

  if (quantityLimit && currentQty > quantityLimit) {
    return quantityLimit;
  }

  if (currentQty === 0) {
    return 1;
  }

  return currentQty;
}

export default function ProductDetail({ product: initialProduct, slug }) {
  const router = useRouter();
  const { requireAuth, redirectToLogin } = useAuthRedirect();
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);
  const cartItems = useCartStore((state) => state.items);
  const buyTwoGetOneDiscountAmount = useCartStore(
    (state) => state.buyTwoGetOneDiscountAmount,
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(null);
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('information');
  const productQuery = useProductBySlug(slug, {
    enabled: Boolean(slug),
    initialData: initialProduct || undefined,
  });
  const { data: settings } = useWebSettings();
  const { data: fetchedProduct, isError } = productQuery;
  const product = fetchedProduct ?? initialProduct;

  const sizeOptions = useMemo(() => {
    const apiSizeOptions = product?.sizes?.map((size) => ({
      value: size.value,
      label: size.label,
      id: size.id,
      price: size.price,
      quantity: size.quantity,
    })).filter((size) => size.value);

    return apiSizeOptions ?? [];
  }, [product?.sizes]);

  const productMedia = useMemo(() => getProductMedia(product), [product]);
  const activeSize = sizeOptions.some((option) => option.value === selectedSize)
    ? selectedSize
    : getDefaultSizeValue(sizeOptions);
  const selectedSizeOption = sizeOptions.find((option) => option.value === activeSize);
  const quantityLimit = selectedSizeOption?.quantity > 0 ? selectedSizeOption.quantity : null;
  const isOutOfStock = selectedSizeOption != null && Number(selectedSizeOption.quantity) === 0;
  const selectedQuantity = resolveQuantityForSize(quantity, selectedSizeOption);
  const canSubmit = Boolean(selectedSizeOption?.id && selectedQuantity > 0 && !isOutOfStock);
  const isSelectedSizeInCart = hasCartItemWithProductSize(cartItems, selectedSizeOption?.id);
  const { buyQty, getQty } = getBuyTwoGetOneQuantities(settings);
  const buyTwoGetOneTicketMessage = getBuyTwoGetOneTicketMessage({
    isEnabled: isBuyTwoGetOneFreeEnabled(settings),
    items: cartItems,
    buyTwoGetOneDiscountAmount,
    buyQty,
    getQty,
  });

  const goToCart = () => {
    router.push(APP_ROUTES.CART);
  };

  if (shouldShowQueryLoader(productQuery)) {
    return (
      <div>
        <Header />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <DotLoaderBlock className="py-0" />
        </section>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div>
        <Header />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-gray-600">Product not found.</p>
        </section>
      </div>
    );
  }

  const handleShareProduct = () => {
    void sharePage({
      title: product.name,
      text: product.name,
    });
  };

  const selectedPrice = selectedSizeOption?.price || product.price;
  const selectedOriginalPrice =
    product.discount > 0 && product.discount < 100
      ? Math.round(selectedPrice / (1 - product.discount / 100))
      : product.originalPrice;

  const refreshCart = async () => {
    const cart = await getCartApi();
    setCart(cart);
  };

  const addCurrentToBag = async () => {
    if (!requireAuth()) return false;

    if (!selectedSizeOption?.id) {
      setCartError('Please select a valid size before adding this product to your bag.');
      setBagDrawerOpen(true);
      return false;
    }

    if (isOutOfStock) {
      setCartError('This size is currently out of stock.');
      setBagDrawerOpen(true);
      return false;
    }

    if (selectedQuantity < 1) {
      setCartError('Please select a quantity before adding this product to your bag.');
      setBagDrawerOpen(true);
      return false;
    }

    if (hasCartItemWithProductSize(cartItems, selectedSizeOption.id)) {
      goToCart();
      return false;
    }

    setCartError('');
    setCartLoading(true);

    try {
      await addCartItemApi({
        product_size_id: selectedSizeOption.id,
        quantity: selectedQuantity,
      });
      const cart = await getCartApi();
      setCart(cart);
      showItemAddedToCartToast(router);
      return true;
    } catch (error) {
      if (error?.response?.status === 401) {
        redirectToLogin();
        return false;
      }

      if (isDuplicateCartError(error)) {
        await refreshCart();
        goToCart();
        return false;
      }

      setCartError(error?.response?.data?.message || error?.message || 'Unable to add this product to your bag.');
      setBagDrawerOpen(true);
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSizeOption?.id) {
      setCartError('Please select a valid size before buying this product.');
      setBagDrawerOpen(true);
      return;
    }

    if (isOutOfStock) {
      setCartError('This size is currently out of stock.');
      setBagDrawerOpen(true);
      return;
    }

    if (selectedQuantity < 1) {
      setCartError('Please select a quantity before buying this product.');
      setBagDrawerOpen(true);
      return;
    }

    const params = new URLSearchParams({
      checkout_type: 'buy_now',
      product_size_id: String(selectedSizeOption.id),
      quantity: String(selectedQuantity),
    });

    router.push(`${APP_ROUTES.PAYMENT_METHOD}?${params.toString()}`);
  };

  const formattedOriginalPrice = selectedOriginalPrice.toLocaleString('en-IN');
  const formattedPrice = selectedPrice.toLocaleString('en-IN');
  const hasMoreProductInfo = product.specs.length > 4;
  const visibleProductSpecs = showFullInfo ? product.specs : product.specs.slice(0, 4);
  const productReviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewsCount = product.review_count ?? productReviews.length;
  const detailTabs = [
    { id: 'information', label: 'Product Information' },
    { id: 'description', label: 'Description' },
    { id: 'size', label: 'Size' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div>
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-36 pt-7 sm:px-6 sm:pb-16 lg:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <section className="space-y-4">
            <div className="relative h-[420px] w-full overflow-hidden bg-[#f8f8f7] sm:h-[560px] lg:h-[650px]">
              {productMedia[selectedImage]?.type === 'video' ? (
                <video
                  key={productMedia[selectedImage].src}
                  src={productMedia[selectedImage].src}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${product.name} product video`}
                />
              ) : (
                <Image
                  src={productMedia[selectedImage]?.src || '/images/product-1.png'}
                  alt={product.name}
                  fill
                  unoptimized={productMedia[selectedImage]?.src?.startsWith('http')}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="eager"
                  fetchPriority="high"
                />
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {productMedia.map((media, index) => (
                <button
                  key={`${media.type}-${media.src}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden bg-[#f8f8f7] transition ${
                    selectedImage === index ? 'ring-1 ring-gray-950' : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  aria-label={
                    media.type === 'video'
                      ? `View ${product.name} video`
                      : `View ${product.name} image ${index + 1}`
                  }
                >
                  {media.type === 'video' ? (
                    <>
                      <video
                        src={media.src}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-950">
                          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <Image
                      src={media.src}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      unoptimized={media.src.startsWith('http')}
                      className="object-contain"
                      sizes="(max-width: 1024px) 25vw, 12vw"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="lg:pl-3">

            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-md  text-gold">
                {product.category?.type === 'sub'
                  ? product.category.name
                  : 'Kayra Aura Collection'}
              </p>
              <div className="flex items-center gap-3">
                <WishlistButton
                  productId={product.id ?? product._id}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                />
                <button
                  type="button"
                  aria-label="Share product"
                  onClick={handleShareProduct}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                >
                  <Share2 className="h-6 w-6" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <h1 className="font-display text-2xl  leading-tight font-semibold text-gray-700 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-medium text-gray-950">₹{formattedPrice}</span>
              {selectedOriginalPrice > selectedPrice && (
                <span className="text-lg text-gray-400 line-through">₹{formattedOriginalPrice}</span>
              )}
              {product.discount > 0 && (
                <span className="text-md font-semibold uppercase  text-green-700">
                  {product.discount}% Off
                </span>
              )}
            </div>

            <p className="mt-4 max-w-xl text-md leading-7 text-gray-500">
              {product.description}
            </p>

            {reviewsCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-gray-100 ">
                <div className="flex items-center gap-2 text-md text-gray-400">
                  <span className="text-[#c9a75d]">★★★★★</span>
                  <span>
                    {reviewsCount === 1 ? 'Review' : 'Reviews'} ({reviewsCount})
                  </span>
                </div>
              </div>
            )}

            <div className="border-b border-gray-100 py-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-950">Size</h2>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="text-sm font-semibold uppercase text-gray-500 transition hover:text-gray-950"
                >
                  Size Guide
                </button>
              </div>

              {sizeOptions.length ? (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
                  {sizeOptions.map((size) => {
                    const isSelected = activeSize === size.value;

                    return (
                      <button
                        key={size.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedSize(size.value)}
                        className={`min-w-16 border px-5 py-2 text-md font-semibold rounded-full  ${
                          isSelected
                            ? 'border-gray-950 bg-gray-950 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-950 hover:text-gray-950'
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sizes available for this product.</p>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 py-3">
              <span className="text-lg font-bold text-gray-950">Quantity</span>
              {isOutOfStock ? (
                <span className="text-base font-bold uppercase tracking-wide text-red-600">
                  Out of Stock
                </span>
              ) : (
                <div className="flex items-center gap-4 text-lg font-semibold text-gray-950">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(0, selectedQuantity - 1) || null)}
                    disabled={selectedQuantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-[#A97818] disabled:cursor-not-allowed disabled:bg-gray-300"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                  <span className="min-w-4 text-center text-base font-semibold">{selectedQuantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextQuantity = selectedQuantity + 1;
                      setQuantity(quantityLimit ? Math.min(nextQuantity, quantityLimit) : nextQuantity);
                    }}
                    disabled={Boolean(quantityLimit && selectedQuantity >= quantityLimit)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-[#A97818] disabled:cursor-not-allowed disabled:bg-gray-300"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                </div>
              )}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-gray-100 bg-white p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:static sm:z-auto sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0 sm:py-3 sm:shadow-none">
              <button
                type="button"
                onClick={addCurrentToBag}
                disabled={cartLoading || (!isSelectedSizeInCart && !canSubmit)}
                className="w-full bg-gray-950 px-4 py-4 text-[14px] font-semibold uppercase text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-7 sm:text-[14px] "
              >
                {cartLoading ? (
                  <LoadingLabel spinnerClassName="border-white border-t-transparent">
                    Adding...
                  </LoadingLabel>
                ) : isSelectedSizeInCart ? (
                  'Go to Cart'
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={cartLoading || !canSubmit}
                className="w-full border border-gray-950 bg-white px-4 py-4 text-[14px] font-semibold uppercase  text-gray-950 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 sm:px-7 sm:text-md"
              >
                Buy Now
              </button>
            </div>

            <section className="mt-3 overflow-hidden bg-[#f7f7f7] text-center text-[11px] font-bold text-gray-950 sm:mt-1">
              <div className="grid grid-cols-3 gap-2 px-3 py-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-700">
                    <IndianRupee className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-700">
                    <RefreshCcw className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="max-w-28 underline underline-offset-2">
                    Return or Exchange within 3 days
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-700">
                    <Truck className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span>Enjoy free delivery on online orders above ₹1,000.</span>
                </div>
              </div>
              <p className="bg-[#e6e6e6] px-3 py-2 text-[11px] font-bold">
                Get it delivered in 3-6 days
              </p>J
              {buyTwoGetOneTicketMessage ? (
                <div className="px-3 pb-2 pt-2">
                  <BuyTwoGetOneTicketBanner
                    fullWidth
                    className="mt-0 w-full"
                    notchColor="#f7f7f7"
                    message={buyTwoGetOneTicketMessage}
                  />
                </div>
              ) : null}
            </section>
          </section>
        </div>

        <section className="mt-8 border-t border-gray-100 pt-8 lg:mt-8">
          <div>
            <div
              className="flex gap-7 overflow-x-auto border-b border-gray-100 text-[18px] font-semibold uppercase t text-gray-900 sm:justify-center sm:gap-12"
              role="tablist"
              aria-label="Product details"
            >
              {detailTabs.map((tab) => {
                const isActive = activeDetailTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveDetailTab(tab.id)}
                    className={`shrink-0 border-b-2 px-1 pb-2 text-gray-900 transition ${
                      isActive ? 'border-gray-900' : 'border-transparent hover:border-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mx-auto max-w-5xl pt-8" id={`${activeDetailTab}-panel`} role="tabpanel">
              {activeDetailTab === 'information' && (
                <div className="border border-gray-100">
                  <h2 className="border-b border-gray-100 px-5 py-4 text-lg font-bold text-gray-900">
                    Product Information
                  </h2>
                  <div>
                    {visibleProductSpecs.map((spec, index) => (
                      <div
                        key={spec.label}
                        className={`flex justify-between gap-6 px-5 py-3 text-sm ${
                          index < visibleProductSpecs.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <span className="text-gray-500">{spec.label}</span>
                        <span className="text-right font-medium text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  {hasMoreProductInfo && (
                    <div className="flex justify-end px-5 pb-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowFullInfo((v) => !v)}
                        className="text-xs font-bold uppercase  text-gray-900 underline underline-offset-4 hover:no-underline"
                      >
                        {showFullInfo ? 'Read Less' : 'Read More'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'description' && (
                <div className="space-y-5 text-lg leading-7 text-gray-500">
                  <p>{product.description}</p>
                  <p>
                    Designed for everyday polish and special occasions, this piece brings a refined finish
                    to your jewellery collection while staying comfortable enough for extended wear.
                  </p>
                  <p>
                    Pair it with your favorite occasion wear or keep it minimal with a clean everyday look.
                  </p>
                </div>
              )}

              {activeDetailTab === 'size' && (
                <div className="grid gap-5 text-sm leading-7 text-gray-500 sm:grid-cols-2">
                  <div className="border border-gray-100 p-5">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">Size Guide</h2>
                    <p>
                      Choosing the right size ensures your piece sits comfortably and looks its best
                      every time you wear it. Start by selecting a size that feels secure without any
                      pressure or tightness against your skin. If you find yourself between two sizes,
                      we recommend choosing the larger option for relaxed, all-day comfort. For rings
                      and bangles, measure an existing piece you already own and compare it with the
                      measurements provided above. Remember that fingers and wrists can swell slightly
                      in warm weather, so a little extra room is always a safe and comfortable choice.
                    </p>
                  </div>
                  <div className="border border-gray-100 p-5">
                    <h3 className="mb-3 text-lg font-semibold  text-gray-900">
                      Available Sizes
                    </h3>
                    {sizeOptions.length ? (
                      <div className="flex flex-wrap gap-2">
                        {sizeOptions.map((size) => (
                          <span key={size.value} className="border border-gray-100 px-4 py-2 text-gray-900">
                            {size.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>No sizes available for this product.</p>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'reviews' && (
                <div className="grid gap-8 text-sm text-gray-500 lg:grid-cols-[1fr_1.1fr]">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-950">
                      Customer Reviews
                    </h3>
                    <p className="max-w-md leading-7">
                      We take pride in the quality of every piece we create. Hear from
                      customers who have experienced the craftsmanship, comfort, and
                      attention to detail that define Kayra Aura.
                    </p>
                    {reviewsCount > 0 && (
                        <p className="text-xs font-semibold uppercase text-gray-900">
                        {reviewsCount} {reviewsCount === 1 ? 'Review' : 'Reviews'}
                      </p>
                    )}
                  </div>
                  <ProductReviewForm
                    productId={product.id ?? product._id}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['products', slug] });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <ProductReviewsSection reviews={productReviews} reviewsCount={reviewsCount} />

        <section className="mt-16 justify-center items-center lg:mt-20">
          <h2 className="mb-9 text-center text-2xl font-semibold text-gray-950">
            Related Products
          </h2>
          <ProductList
              featured
              limit={3}
              variant="editorial"
              emptyMessage="No related products available."
          />
        </section>
      </main>

      <CartDrawer
        open={bagDrawerOpen}
        onClose={() => setBagDrawerOpen(false)}
        isLoading={cartLoading}
        error={cartError}
      />
      <SizeChartModal open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
