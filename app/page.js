import Link from 'next/link';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import HomeCollectionShowcase from '@/components/HomeCollectionShowcase';
import ProductList from '@/components/ProductList';
import { getCategories } from '@/lib/categories';
import { getAllProducts, getCollectionProducts, getFeaturedProducts } from '@/lib/products';
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
  getSocialSameAs,
} from '@/lib/structured-data';
import { getBannerCarouselImages, getBannerSettings } from '@/lib/banners';
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
  const [categories, allProducts, collectionProducts, featuredProducts, webSettings, bannerSettings] =
    await Promise.all([
      getCategories(),
      getAllProducts(),
      getCollectionProducts(),
      getFeaturedProducts(),
      getWebSettings(),
      getBannerSettings(),
    ]);

  const productsBelowVideo = allProducts.slice(20, 40);
  const showBestSellerProducts = productsBelowVideo.length > 0 || featuredProducts.length > 0;
  const useFeaturedForBestSeller = productsBelowVideo.length === 0;
  const bannerImages = getBannerCarouselImages(bannerSettings);
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
            images={bannerImages}
            title={bannerSettings.banner_title}
            description={bannerSettings.banner_description}
          />
        </div>

        {/* Categories Section */}
        <section className="home-scroll-stable mx-auto max-w-7xl px-4 py-6 sm:px-6" style={{ '--home-delay': '90ms' }}>
          <div className="mb-8">
          <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl ">Categories</h2>
          </div>

          <CategoryGrid variant="strip" limit={6} initialCategories={categories} />
        </section>
        <section className="home-scroll-stable mx-auto max-w-7xl px-4 pb-20 sm:px-6" style={{ '--home-delay': '160ms' }}>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">Products</h2>
          </div>
          <ProductList
              limit={20}
              variant="editorial"
              emptyMessage="No products available at the moment."
              initialProducts={allProducts}
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
            <h2 className="home-reveal font-display text-4xl font-light uppercase leading-[0.92] tracking-[-0.04em] sm:text-5xl lg:text-[72px]" style={{ '--home-delay': '420ms' }}>
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

        <section className="home-scroll-stable mx-auto max-w-7xl mt-8 px-4 pb-4 sm:px-6" style={{ '--home-delay': '120ms' }}>
          <HomeCollectionShowcase
            limit={4}
            emptyMessage=" "
            initialProducts={collectionProducts}
          />
        </section>

        {/* Best Seller Products Section */}
        <section className="home-scroll-stable " style={{ '--home-delay': '140ms' }}>
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
            <div className="home-reveal lg:pt-8" style={{ '--home-delay': '180ms' }}>
              <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-gray-400">Shop</p>
              <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">
                <span className="inline sm:block">Best Seller</span>{' '}
                <span className="inline sm:block">Products</span>
              </h2>
              <p className="mt-5 text-sm leading-6 text-gray-600">
                Discover our handpicked collection of exquisite jewellery pieces, curated to elevate
                every style and capture the essence of sophistication.
              </p>
            </div>

            <div>
              {showBestSellerProducts ? (
                <>
                  <div >
                  </div>
                  {useFeaturedForBestSeller ? (
                    <ProductList
                        featured
                        limit={4}
                        variant="editorial"
                        emptyMessage="No featured products available at the moment."
                        initialProducts={featuredProducts}
                    />
                  ) : (
                    <ProductList
                        limit={4}
                        offset={20}
                        variant="editorial"
                        emptyMessage="No products available at the moment."
                        initialProducts={allProducts}
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
  );
}
