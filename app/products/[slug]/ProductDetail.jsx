'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Share2 } from 'lucide-react';
import Header from '../../../components/Header';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductList from '@/components/ProductList';
import WishlistButton from '@/components/WishlistButton';
import { LoaderBlock } from '@/components/ui/loader';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES } from '@/lib/routes';
import { useProductBySlug } from '@/hooks/use-products';
import { addCartItemApi, getCartApi } from '@/services/cart';

function imageUrlFromValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.image_url || value.image_path || '';
}

function getProductImages(product) {
  const imageSources = [product?.gallery, product?.images, product?.image, product?.product_images, product?.productImages];
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
      .filter(Boolean);
  }

  const singleImage = product?.image_url || product?.image_path;
  return singleImage ? [singleImage] : ['/images/product-1.png'];
}

export default function ProductDetail({ product: initialProduct, slug }) {
  const router = useRouter();
  const setCart = useCartStore((state) => state.setCart);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(null);
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('information');
  const { data: fetchedProduct, isLoading, isError } = useProductBySlug(slug, {
    enabled: !initialProduct && Boolean(slug),
  });
  const product = initialProduct ?? fetchedProduct;

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

  const productImages = getProductImages(product);
  const activeSize = sizeOptions.some((option) => option.value === selectedSize) ? selectedSize : '';
  const selectedSizeOption = sizeOptions.find((option) => option.value === activeSize);
  const selectedQuantity = Number(quantity) || 1;
  const quantityLimit = selectedSizeOption?.quantity > 0 ? selectedSizeOption.quantity : null;
  const canSubmit = Boolean(selectedSizeOption?.id && selectedQuantity > 0);

  if (isLoading) {
    return (
      <div>
        <Header />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <LoaderBlock className="py-0" />
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
    if (!selectedSizeOption?.id) {
      setCartError('Please select a valid size before adding this product to your bag.');
      setBagDrawerOpen(true);
      return false;
    }

    if (selectedQuantity < 1) {
      setCartError('Please select a quantity before adding this product to your bag.');
      setBagDrawerOpen(true);
      return false;
    }

    setCartError('');
    setCartLoading(true);
    setBagDrawerOpen(true);

    try {
      await addCartItemApi({
        product_size_id: selectedSizeOption.id,
        quantity: selectedQuantity,
      });
      await refreshCart();
      return true;
    } catch (error) {
      setCartError(error?.response?.data?.message || error?.message || 'Unable to add this product to your bag.');
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
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                unoptimized={productImages[selectedImage]?.startsWith('http')}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden bg-[#f8f8f7] transition ${
                    selectedImage === index ? 'ring-1 ring-gray-950' : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  aria-label={`View ${product.name} image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    unoptimized={image.startsWith('http')}
                    className="object-contain"
                    sizes="(max-width: 1024px) 25vw, 12vw"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="lg:pl-3">

            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-md  text-gold">
                {product.category?.name || 'Kyara Aura Collection'}
              </p>
              <div className="flex items-center gap-3">
                <WishlistButton
                  productId={product.id ?? product._id}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                />
                <button
                  type="button"
                  aria-label="Share product"
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

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-gray-100 ">
              <div className="flex items-center gap-2 text-md text-gray-400">
                <span className=" text-[#c9a75d]">★★★★★</span>
                <span>(68 Reviews)</span>
              </div>
            </div>

            <div className="border-b border-gray-100 py-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-950">Size</h2>
                <button
                  type="button"
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
                        className={`min-w-16 border px-5 py-2 text-md font-semibold rounded-md  ${
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

            <div className="flex items-center justify-between border-b border-gray-100 py-7">
              <span className="text-lg font-bold text-gray-950">Quantity</span>
              <div className="flex items-center rounded-2xl gap-6 text-lg font-semibold px-5 py-1 border  border-gray-950 text-gray-950">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(0, (q ?? 1) - 1) || null)}
                  disabled={!quantity}
                  className="text-3xl transition hover:text-gray-950 disabled:cursor-not-allowed disabled:text-gray-600"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-4 text-center">{quantity || 1}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => {
                    const nextQuantity = (q ?? 1) + 1;
                    return quantityLimit ? Math.min(nextQuantity, quantityLimit) : nextQuantity;
                  })}
                  disabled={Boolean(quantityLimit && quantity >= quantityLimit)}
                  className="text-lg transition hover:text-gray-950 disabled:cursor-not-allowed disabled:text-gray-600"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-gray-100 bg-white p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:static sm:z-auto sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0 sm:py-7 sm:shadow-none">
              <button
                type="button"
                onClick={addCurrentToBag}
                disabled={cartLoading || !canSubmit}
                className="w-full bg-gray-950 px-4 py-4 text-[14px] font-semibold uppercase text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-7 sm:text-[14px] "
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
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
          </section>
        </div>

        <section className="mt-8 border-t border-gray-100 pt-8 lg:mt-12">
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
                  {showFullInfo && product.description && (
                    <p className="border-t border-gray-100 px-5 py-4 text-sm leading-7 text-gray-500">
                      {product.description}
                    </p>
                  )}
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
                      Choose the size that feels secure without pressure. If you are between two sizes,
                      select the larger option for comfortable everyday wear.
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
                  <div className="space-y-5">
                    <div>
                      <p className="mb-1 font-semibold text-gray-900">★★★★★</p>
                      <p>
                        A refined finish and comfortable fit make this piece a customer favorite for
                        both everyday styling and special occasions.
                      </p>
                    </div>
                    <p className="text-xs font-semibold uppercase text-gray-900">
                      68 Reviews
                    </p>
                  </div>
                  <form className="space-y-5 bg-[#f8f8f7] p-6">
                    <h2 className="text-lg font-semibold   text-gray-900">
                      Leave a Review
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="border-b border-gray-300 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Your Order ID"
                        className="border-b border-gray-300 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      className="w-full border-b border-gray-300 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                    />
                    <textarea
                      placeholder="Your Review"
                      rows={3}
                      className="w-full resize-none border-b border-gray-300 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      className="bg-gray-900 px-4 py-2 rounded-md  text-md font-semibold   text-white transition hover:bg-gray-800"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>

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
    </div>
  );
}
