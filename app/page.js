import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import ProductList from '@/components/ProductList';

export default function HomePage() {
  return (
    <div>
      <Header />
      <HeroCarousel />

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="font-display text-2xl md:text-3xl text-gray-900 mb-3">Shop by Category</h2>
        <p className="text-gold mb-10">
          Explore our exquisite collections crafted for every occasion.
        </p>
        <CategoryGrid />
      </section>

      {/* Welcome Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">

        {/* Light rose gold background/effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-rose-100/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,163,115,0.08),transparent_60%)]" />

        {/* Background Image */}
        <div className="absolute inset-0 w-full">
          <Image
              src="/assets/welcomebg.jpg"
              alt="Welcome"
              fill
              className="object-cover opacity-50 w-full"
              priority
          />
        </div>

        {/* Light overlay for better text visibility */}
        <div className="absolute inset-0 bg-white/70" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl text-center px-4">
          <h2 className="font-display text-3xl md:text-5xl text-gray-900 mb-6">
            Welcome to Kyara-Aura
          </h2>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Welcome to Kyara-Aura, where timeless elegance meets modern craftsmanship. Our curated collection of fine jewellery celebrates life&apos;s most precious moments with pieces that tell your unique story. Each creation is meticulously crafted with the finest materials and attention to detail, ensuring that every piece becomes a cherished heirloom. At Kyara-Aura, we believe that jewellery is not just an accessory, but a symbol of love, achievement, and personal style that empowers your journey and marks your milestones with grace and sophistication.
          </p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-display text-2xl md:text-3xl text-gray-900">Featured</h2>
          <Link href="/products" className="text-sm text-gold hover:text-gold-light transition-colors">
            View all
          </Link>
        </div>
        <ProductList
          featured
          emptyMessage="No featured products available at the moment."
        />
      </section>

      
      {/* Most Wishlisted Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-gray-200 bg-gray-50/50">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-gold text-xs tracking-[0.25em] uppercase mb-2">Community picks</p>
            <h2 className="font-display text-2xl md:text-3xl text-gray-900">Most wishlisted</h2>
          </div>
          <Link href="/products" className="text-sm text-gold hover:text-gold-light transition-colors">
            Shop all
          </Link>
        </div>
        <ProductList limit={4} />
      </section>

          </div>
  );
}
