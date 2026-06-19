
import Header from '../../components/Header';
import ProductList from '@/components/ProductList';
import {Cormorant_Garamond} from "next/font/google";

const categoryDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;


  return (
    <div className="bg-white text-gray-950">
      <Header />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:pb-16">
        <div className="mb-8 text-center">
          <h1 className={`${categoryDisplay.className} mb-2  text-3xl font-medium tracking-[-0.05em] text-gray-950 md:text-5xl`}>
            Products
          </h1>
        </div>

        <ProductList
          key={categoryId ?? 'all-products'}
          categoryId={categoryId}
          pageSize={16}
          variant="catalog"
        />
      </section>
    </div>
  );
}
