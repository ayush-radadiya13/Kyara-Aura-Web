'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * @param {{ product: { name: string; slug: string; image: string | null; price: number; discountPercentage: number; finalPrice: number } }} props
 */
export default function HeroSaleBanner({ product }) {
  if (!product) return null;

  const href = `/products/${product.slug}`;

  return (
    <section className="relative overflow-hidden text-gray-900 hero-sale-enter">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(212,163,115,0.15),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_80%,rgba(197,139,43,0.12),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:grid md:grid-cols-2 md:items-center gap-10 md:gap-12 lg:gap-14">
          <div className="order-1 md:order-2 flex items-center justify-center md:justify-end">
            <div className="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-md h-[400px] sm:h-[410px] md:h-[420px] max-h-[420px] flex items-center justify-center p-4 hero-sale-img rounded-none overflow-hidden bg-white/60 shadow-gold-glow-sm ring-1 ring-gold/20 border border-gray-200">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain object-center max-h-full"
                  sizes="(max-width: 640px) 300px, (max-width: 768px) 340px, 380px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-gold/20 to-gray-100 flex items-center justify-center text-gray-400 text-sm tracking-widest uppercase">
                  {product.name}
                </div>
              )}
            </div>
          </div>

          <div className="order-2 md:order-1 text-center md:text-left">
            <p className="text-gold text-xs sm:text-sm tracking-[0.35em] uppercase mb-4 font-medium">
              Limited offer
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-tight text-gray-900">
              Perfume Year-End Sale!
            </h1>
            <p className="mt-5 text-2xl sm:text-3xl md:text-4xl font-display text-gold">
              Up to {product.discountPercentage}% OFF
            </p>
            <p className="mt-6 text-gray-600 text-sm sm:text-base max-w-xl mx-auto md:mx-0 leading-relaxed">
              Discover an exquisite collection of premium perfumes at unbelievable prices during our
              exclusive sale!
            </p>
            <p className="mt-4 text-gray-600 text-sm">
              <span className="line-through text-gray-400 mr-2">
                ${product.price}
              </span>
              <span className="text-gold font-semibold text-lg">
                ${product.finalPrice}
              </span>
              <span className="ml-2 text-gray-500">· {product.name}</span>
            </p>
            <Link href={href} className="btn-gold inline-block mt-10 px-10 py-3.5 text-sm">
              Know More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
