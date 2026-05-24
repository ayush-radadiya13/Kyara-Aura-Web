import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';

// Static mock data for jewellery demonstration
const mockCategories = [
  { _id: '1', name: 'Rings', image: '/images/rings-category.jpg' },
  { _id: '2', name: 'Necklaces', image: '/images/necklaces-category.jpg' },
  { _id: '3', name: 'Earrings', image: '/images/earrings-category.jpg' },
  { _id: '4', name: 'Bracelets', image: '/images/bracelets-category.jpg' },
  { _id: '5', name: 'Pendants', image: '/images/pendants-category.jpg' },
  { _id: '6', name: 'Sets', image: '/images/sets-category.jpg' },
];

const mockProducts = [
  { _id: '1', name: 'Celestial Diamond Ring', slug: 'celestial-diamond-ring', price: 1240, category: { name: 'Rings' }, images: ['/images/product-1.png'] },
  { _id: '2', name: 'Rose Gold Halo Set', slug: 'rose-gold-halo-set', price: 980, category: { name: 'Sets' }, images: ['/images/product-2.png'] },
  { _id: '3', name: 'Pearl Grace Pendant', slug: 'pearl-grace-pendant', price: 760, category: { name: 'Pendants' }, images: ['/images/product-3.png'] },
  { _id: '4', name: 'Midnight Diamond Earrings', slug: 'midnight-diamond-earrings', price: 1450, category: { name: 'Earrings' }, images: ['/images/product-4.png'] },
];

const mockMostWishlisted = [
  { _id: '5', name: 'Eternal Love Bracelet', slug: 'eternal-love-bracelet', price: 890, category: { name: 'Bracelets' }, images: ['/images/product-5.png'] },
  { _id: '6', name: 'Royal Sapphire Ring', slug: 'royal-sapphire-ring', price: 2100, category: { name: 'Rings' }, images: ['/images/product-6.png'] },
  { _id: '7', name: 'Vintage Crystal Necklace', slug: 'vintage-crystal-necklace', price: 1350, category: { name: 'Necklaces' }, images: ['/images/product-7.png'] },
  { _id: '8', name: 'Diamond Stud Earrings', slug: 'diamond-stud-earrings', price: 680, category: { name: 'Earrings' }, images: ['/images/product-8.png'] },
];


function categoryImageSrc(image) {
  if (!image || typeof image !== 'string') return '';
  if (image.startsWith('http')) return image;
  return image;
}

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {mockCategories.map((c) => {
            const src = categoryImageSrc(c.image);
            return (
              <Link
                key={c._id}
                href={`/products?category=${c._id}`}
                className="group relative aspect-square rounded-lg overflow-hidden glass-card hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-white"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gray-50 to-gray-100 flex items-center justify-center p-4">
                    <span className="font-display text-sm sm:text-lg text-gray-600/80 text-center">{c.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 font-medium text-white text-xs sm:text-sm text-center">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
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
            Welcome to Kyara-Aura, where timeless elegance meets modern craftsmanship. Our curated collection of fine jewellery celebrates life's most precious moments with pieces that tell your unique story. Each creation is meticulously crafted with the finest materials and attention to detail, ensuring that every piece becomes a cherished heirloom. At Kyara-Aura, we believe that jewellery is not just an accessory, but a symbol of love, achievement, and personal style that empowers your journey and marks your milestones with grace and sophistication.
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
        {mockProducts.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {mockProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 py-12 text-center">
            No featured products available at the moment.
          </p>
        )}
      </section>

      
      {/* Most Wishlisted Section */}
      {mockMostWishlisted.length > 0 && (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {mockMostWishlisted.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

          </div>
  );
}
