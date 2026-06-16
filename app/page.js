import Link from 'next/link';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import HomeCollectionShowcase from '@/components/HomeCollectionShowcase';
import ProductList from '@/components/ProductList';
import { absoluteUrl, jsonLd, metadataForPage } from '@/lib/seo';

const homeDescription =
  'Discover Kyara Aura fashion jewellery, including gold plated bangles, earrings, necklaces, rings, and elegant pieces for everyday and occasion styling.';

export const metadata = metadataForPage({
  title: 'Kyara Aura | Fashion Jewellery for Women',
  description: homeDescription,
  path: '/',
  images: ['/assets/home1.jpg'],
});

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kyara Aura',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/assets/ka1.png'),
    sameAs: [],
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kyara Aura',
    url: absoluteUrl('/'),
  };

  return (
      <div className="bg-white ">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(websiteSchema)}
        />
        <Header />
        <div className="home-scroll-stable">
          <HeroCarousel variant="editorial" />
        </div>

        {/* Categories Section */}
        <section className="home-scroll-stable mx-auto max-w-7xl px-4 py-14 sm:px-6" style={{ '--home-delay': '90ms' }}>
          <div className="mb-8">
          <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl ">Categories</h2>
          </div>

          <CategoryGrid variant="strip" limit={6} />
        </section>
        <section className="home-scroll-stable mx-auto max-w-7xl px-4 pb-20 sm:px-6" style={{ '--home-delay': '160ms' }}>
          <div className="mb-8 flex items-center justify-between gap-6">
            <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">Products</h2>
            <div className="hidden items-center gap-4 text-[10px] text-gray-400 sm:flex">
              <span>Sort by</span>
              <Link
                  href="/products"
                  className="border-b border-gray-200 px-5 pb-3 text-gray-950 transition duration-300 hover:-translate-y-0.5 hover:border-gray-950"
              >
                Women Product
              </Link>
              <span className="text-gray-500">⌄</span>
            </div>
          </div>
          <ProductList
              featured
              limit={6}
              variant="editorial"
              emptyMessage="No featured products available at the moment."
          />
        </section>


        <section
          className="home-scroll-stable relative min-h-[72vh] overflow-hidden bg-gray-950"
          style={{ '--home-delay': '220ms' }}
        >
          <video
              className="home-drift pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.45]"
              src="/vedio/vedio1.mp4"
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/home4.jpg"
              aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45" />
          <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
            <p className="home-reveal mb-4 text-[10px] font-semibold uppercase tracking-[0.45em] text-white/80" style={{ '--home-delay': '320ms' }}>
              Jewellery
            </p>
            <h2 className="home-reveal font-display text-5xl font-light uppercase leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[92px]" style={{ '--home-delay': '420ms' }}>
              New Arrival
            </h2>
            <p className="home-reveal mt-5 max-w-xl text-xs leading-5 text-white/85 sm:text-sm" style={{ '--home-delay': '520ms' }}>
              Presented in timeless adornment, for those who seek both beauty and refined minimalism.
            </p>
            <Link
                href="/products"
                className="home-reveal mt-8 border border-white/70 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-gray-950 hover:shadow-2xl hover:shadow-white/20"
                style={{ '--home-delay': '620ms' }}
            >
              Shop Now
            </Link>
          </div>
        </section>

        <section className="home-scroll-stable mx-auto max-w-7xl px-4 pb-10 sm:px-6" style={{ '--home-delay': '120ms' }}>
          <div className="mb-10 grid grid-cols-2 items-center gap-8 text-center text-xs uppercase tracking-[0.28em] text-gray-300 sm:grid-cols-3 lg:grid-cols-6">
            {['Holliage', 'Aura', 'QKE', 'Bridal', 'Kyara', 'Lumiere'].map((brand, index) => (
                <span
                    key={brand}
                    className="home-reveal font-display normal-case tracking-normal transition duration-300 hover:-translate-y-1 hover:text-gray-950"
                    style={{ '--home-delay': `${index * 70}ms` }}
                >
              {brand}
            </span>
            ))}
          </div>

          <HomeCollectionShowcase
            limit={4}
            emptyMessage="No collection products available at the moment."
          />
        </section>

        {/* Best Seller Products Section */}
        <section className="home-scroll-stable " style={{ '--home-delay': '140ms' }}>
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr]">
            <div className="home-reveal lg:pt-8" style={{ '--home-delay': '180ms' }}>
              <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-gray-400">Shop</p>
              <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">
                On Trending
                <span className="block">Products</span>
              </h2>
              <p className="mt-5 text-sm leading-6 text-gray-600">
                Discover our handpicked collection of exquisite jewellery pieces, curated to elevate
                every style and capture the essence of sophistication.
              </p>
            </div>

            <div>
              <div className="mb-8 flex items-center justify-between gap-6">
                <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">
                  Best Seller
                </h2>
                <div className="hidden items-center gap-4 text-[10px] text-gray-400 sm:flex">
                  <span>Sort by</span>
                  <Link
                      href="/products"
                      className="border-b border-gray-200 px-5 pb-3 text-gray-950 transition duration-300 hover:-translate-y-0.5 hover:border-gray-950"
                  >
                    Women Product
                  </Link>
                  <span className="text-gray-500">⌄</span>
                </div>
              </div>
              <ProductList
                  featured
                  pageSize={12}
                  variant="editorial"
                  emptyMessage="No featured products available at the moment."
              />
            </div>
          </div>
        </section>
      </div>
  );
}
