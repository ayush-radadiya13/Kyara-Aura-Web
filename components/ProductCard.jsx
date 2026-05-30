import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  const href = `/products/${product.slug}`;
  const originalPrice = product.oldPrice ?? product.originalPrice;

  return (
    <div className="group block rounded-lg glass-card overflow-hidden hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-[1.02]">
      <div
        className="relative w-full h-40 sm:h-48 md:h-52 lg:h-56 p-2 sm:p-3 bg-gradient-to-b from-gray-50 via-gray-100 to-white shadow-[inset_0_0_32px_rgba(0,0,0,0.05)]"
      >
        <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
        <div className="relative z-0 flex h-full w-full items-center justify-center">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
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
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <span className="text-xl sm:text-2xl">♡</span>
          </button>
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gold/90 uppercase tracking-wider leading-tight">{product.category?.name}</p>
        <h3 className="font-display text-xs sm:text-sm md:text-base mt-0.5 text-gray-900 group-hover:text-gold transition-colors duration-200 line-clamp-2 leading-snug">{product.name}</h3>
        
        {/* Price Section */}
        <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gold">₹{product.price?.toLocaleString('en-IN')}</p>
            {originalPrice && originalPrice > product.price && (
              <>
                <p className="text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                {product.discount && (
                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                    {product.discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add to Bag Button */}
        <button className="mt-2 sm:mt-3 w-full btn-gold py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] transition-transform">
          <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Add to Bag</span>
          <span className="sm:hidden">Bag</span>
        </button>
      </div>
    </div>
  );
}
