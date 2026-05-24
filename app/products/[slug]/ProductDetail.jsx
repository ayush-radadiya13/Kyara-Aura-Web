'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BuyNowModal from '../../../components/BuyNowModal';
import { useCartStore } from '@/lib/cart/store';

export default function ProductDetail({ product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 50, seconds: 2 });
  const [quantity, setQuantity] = useState(1);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('2.4');
  const [showFullInfo, setShowFullInfo] = useState(false);

  const sizeOptions = [
    { value: '2.4', label: '2.4 (Small)' },
    { value: '2.6', label: '2.6 (Regular)' },
    { value: '2.8', label: '2.8 (Medium)' },
    { value: '2.10', label: '2.10 (Large)' },
    { value: '2.12', label: '2.12 (Largest)' },
  ];

  const productImages = product.gallery;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => time.toString().padStart(2, '0');

  const getSizeLabel = (sizeValue) =>
    sizeOptions.find((option) => option.value === sizeValue)?.label ?? sizeValue;

  const addCurrentToBag = () => {
    addItem({
      slug: product.slug,
      title: product.name,
      image: productImages[0],
      size: selectedSize,
      sizeLabel: getSizeLabel(selectedSize),
      quantity,
      price: product.price,
      originalPrice: product.originalPrice,
    });
  };

  const handleBuyNowConfirm = () => {
    addCurrentToBag();
    setIsBuyNowOpen(false);
    router.push('/cart');
  };

  const formattedOriginalPrice = product.originalPrice.toLocaleString('en-IN');
  const lowCouponPrice = Math.max(product.price - 100, 1);

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative bg-gray-100 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  style={{ aspectRatio: '1/1' }}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug flex-1">
                {product.name}
              </h1>
              <button
                type="button"
                aria-label="Share product"
                className="shrink-0 p-1 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-lg text-gray-400 line-through">₹{formattedOriginalPrice}</span>
                {product.discount > 0 && (
                  <span className="text-base font-semibold text-green-600">{product.discount}% Off</span>
                )}
              </div>

              <div className="bg-gray-100 rounded-md px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">Hurry Up, Shop Now!</span>
                  <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-mono tabular-nums">
                      {formatTime(timeLeft.hours)}H:{formatTime(timeLeft.minutes)}M:{formatTime(timeLeft.seconds)}S
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 border-2 border-dashed border-green-500 rounded-md px-4 py-3 text-left hover:bg-green-50/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="font-semibold text-gray-900">
                    Get this as low as ₹{lowCouponPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Final Price inclusive of all taxes
              </p>
            </div>

            <div className="bg-gray-100 rounded-md p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-2 px-1">
                  <span className="text-xl font-medium text-gray-800">₹</span>
                  <span className="text-xs font-medium text-gray-800 leading-tight">Cash on Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 px-1">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-800 leading-tight underline underline-offset-2">
                    Return or Exchange within 3 days
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 px-1">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-800 leading-tight">Free Delivery</span>
                </div>
              </div>
              <div className="bg-gray-200 text-gray-800 text-center py-2.5 rounded text-sm font-medium">
                Get it delivered in 3-6 days
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={addCurrentToBag}
                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 py-3.5 rounded font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Add to bag
              </button>
              <button
                type="button"
                onClick={() => setIsBuyNowOpen(true)}
                className="flex-1 bg-[#5c2e2e] text-white py-3.5 rounded font-semibold hover:bg-[#4a2525] transition-colors"
              >
                Buy Now
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="product-size" className="text-sm font-bold text-gray-900">
                  Size
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Size Chart
                </button>
              </div>
              <div className="relative">
                <select
                  id="product-size"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded px-4 py-3 pr-10 text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-500"
                >
                  {sizeOptions.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-gray-900">Quantity</span>
              <div className="inline-flex items-center border border-gray-300 rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-r border-gray-300 transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-l border-gray-300 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-1">
              <div className="bg-green-600 px-1 pb-1">
                <div className="coupon-scallop" aria-hidden="true" />
                <div className="bg-white px-6 py-5 text-center">
                  <svg className="w-9 h-9 mx-auto mb-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8v13m0-13V6a2 2 0 112 0v2m-2 0h4m-4 0a2 2 0 104 0m-4 0v2m0 0H8m4 0h4M7 10h10v11H7V10z"
                    />
                  </svg>
                  <p className="text-lg font-bold tracking-wide">
                    <span className="text-gray-900">BUY 2 </span>
                    <span className="text-green-600">GET 1 FREE</span>
                  </p>
                  <p className="text-xs text-gray-700 mt-1">Choose from a wide range of options</p>
                  <div className="border-t border-dashed border-gray-300 my-4" />
                  <button
                    type="button"
                    className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    Start Shopping →
                  </button>
                </div>
                <div className="coupon-scallop coupon-scallop-bottom" aria-hidden="true" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-md overflow-hidden">
              <h2 className="text-sm font-bold text-gray-900 px-4 pt-4 pb-2">Product Information</h2>
              <div>
                {product.specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={`flex justify-between items-center px-4 py-3 text-sm ${
                      index < product.specs.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="font-medium text-gray-900 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
              {showFullInfo && (
                <div className="px-4 pb-3 text-sm text-gray-600 leading-relaxed border-t border-gray-200 pt-3">
                  {product.description}
                </div>
              )}
              <div className="flex justify-end px-4 pb-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFullInfo((v) => !v)}
                  className="text-xs font-bold text-gray-900 underline underline-offset-2 hover:no-underline"
                >
                  {showFullInfo ? 'READ LESS' : 'READ MORE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BuyNowModal
        open={isBuyNowOpen}
        onClose={() => setIsBuyNowOpen(false)}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onConfirm={handleBuyNowConfirm}
      />
    </div>
  );
}
