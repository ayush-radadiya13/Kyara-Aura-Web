import { Cormorant_Garamond } from 'next/font/google';
import Header from '@/components/Header';
import ProductList from '@/components/ProductList';
import { getCollectionProducts } from '@/lib/products';
import { metadataForPage } from '@/lib/seo';

const collectionDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata = metadataForPage({
  title: 'Jewellery Collections | Kayra Aura',
  description:
    'Explore Kayra Aura jewellery collections with curated bangles, rings, earrings, necklaces, and elegant fashion jewellery for special occasions and everyday styling.',
  path: '/collections',
  images: ['/assets/image.png'],
});

export default async function CollectionsPage() {
  const initialProducts = await getCollectionProducts();

  return (
    <div className="bg-white text-gray-950">
      <Header />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pb-16">
        <div className="mb-4 text-center">
          <h1 className={`${collectionDisplay.className} mb-2 text-3xl font-medium tracking-[-0.05em] text-gray-950 md:text-5xl`}>
            Collections
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-gray-600 md:text-lg">
            Discover selected pieces designed to complement every celebration and everyday look.
          </p>
        </div>

        <ProductList
          collection
          pageSize={20}
          variant="catalog"
          emptyMessage="No collection products available at the moment."
          initialProducts={initialProducts}
        />
      </section>
    </div>
  );
}
