import Link from 'next/link';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import HomeCollectionShowcase from '@/components/HomeCollectionShowcase';
import ProductList from '@/components/ProductList';
import { getCategories } from '@/lib/categories';
import {
  getCollectionProducts,
  getFeaturedProducts,
} from '@/lib/products';
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
  getSocialSameAs,
} from '@/lib/structured-data';
import { getBannerSettings } from '@/lib/banners';
import { getWebSettings } from '@/lib/web-settings';
import { jsonLd, metadataForPage } from '@/lib/seo';

const homeDescription =
  "Discover Kayra Aura's premium fashion jewellery collection for men and women. Shop rings, bangles, earrings, necklaces, bracelets and more for every occasion.";

export const metadata = metadataForPage({
  title: 'Kayra Aura | Premium Fashion Jewellery Collection',
  description: homeDescription,
  path: '/',
  images: ['/assets/home1.jpg'],
});

export default async function HomePage() {
  const [categories, featuredProducts, collectionProducts, webSettings, bannerSettings] =
    await Promise.all([
      getCategories(),
      getFeaturedProducts(),
      getCollectionProducts(),
      getWebSettings(),
      getBannerSettings(),
    ]);

  const bannerVideo = bannerSettings.video || bannerSettings.video_url;

  const sameAs = getSocialSameAs(webSettings);
  const organizationSchema = buildOrganizationSchema({
    sameAs,
    logo: webSettings.logo_url || webSettings.logo || '/assets/ka1.png',
  });
  const websiteSchema = buildWebsiteSchema();

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
          <HeroCarousel
            variant="editorial"
            initialBannerSettings={bannerSettings}
          />
        </div>

        {/* Categories Section */}
        <section className="home-scroll-stable mx-auto max-w-7xl px-4 py-14 sm:px-6" style={{ '--home-delay': '90ms' }}>
          <div className="mb-8">
          <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl ">Categories</h2>
          </div>

          <CategoryGrid variant="strip" limit={6} initialCategories={categories} />
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
              initialProducts={featuredProducts}
          />
        </section>


        <section
          className="home-scroll-stable relative min-h-[72vh] overflow-hidden bg-gray-950"
          style={{ '--home-delay': '220ms' }}
        >
          <video
              className="home-drift pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.45]"
              src={bannerVideo || undefined}
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
              {bannerSettings.video_title}
            </h2>
            <p className="home-reveal mt-5 max-w-xl text-xs leading-5 text-white/85 sm:text-sm" style={{ '--home-delay': '520ms' }}>
              {bannerSettings.video_description}
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

        <section className="home-scroll-stable mx-auto max-w-7xl mt-4 px-4 pb-10 sm:px-6" style={{ '--home-delay': '120ms' }}>
          <HomeCollectionShowcase
            limit={4}
            emptyMessage=" "
            initialProducts={collectionProducts}
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
                  initialProducts={featuredProducts}
              />
            </div>
          </div>
        </section>
      </div>
  );
}
