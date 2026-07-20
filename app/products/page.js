import Header from '../../components/Header';
import ProductList from '@/components/ProductList';
import { Cormorant_Garamond } from 'next/font/google';
import {
  categoryProductsPath,
  categorySeoDescription,
  getSelectedCategoryFromParams,
  resolveCategoryId,
} from '@/lib/category-seo';
import { getCategories } from '@/lib/categories';
import {
  DEFAULT_PRODUCTS_PER_PAGE,
  getPaginatedProducts,
} from '@/lib/products';
import { metadataForPage } from '@/lib/seo';

const categoryDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

function resolvePageParam(pageParam) {
  const raw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function generateMetadata({ searchParams }) {
  const selectedCategory = await getSelectedCategoryFromParams(
    searchParams,
    getCategories,
  );

  if (selectedCategory) {
    const categoryId = resolveCategoryId(selectedCategory);

    return metadataForPage({
      title: `${selectedCategory.name} Jewellery | Kayra Aura`,
      description: categorySeoDescription(selectedCategory),
      path: categoryProductsPath(categoryId),
      images: selectedCategory.image ? [selectedCategory.image] : ['/assets/image.png'],
    });
  }

  return metadataForPage({
    title: 'Shop Fashion Jewellery | Kayra Aura',
    description:
      'Browse Kayra Aura fashion jewellery including gold plated bangles, earrings, necklaces, rings, and elegant pieces for everyday and occasion styling.',
    path: '/products',
  });
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;
  const page = resolvePageParam(params?.page);

  const { products: initialProducts, pagination: initialPagination } =
    await getPaginatedProducts({
      page,
      perPage: DEFAULT_PRODUCTS_PER_PAGE,
      categoryId,
    });

  return (
    <div className="bg-white text-gray-950">
      <Header />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:pb-16">
        <div className="mb-4 text-center">
          <h1 className={`${categoryDisplay.className} mb-2 text-3xl font-medium tracking-[-0.05em] text-gray-950 md:text-5xl`}>
            Products
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-gray-600 md:text-lg">
            Discover timeless jewellery pieces crafted with beauty, quality, and sophistication in mind.
          </p>
        </div>

        <ProductList
          key={`${categoryId ?? 'all-products'}-page-${page}`}
          categoryId={categoryId}
          pageSize={DEFAULT_PRODUCTS_PER_PAGE}
          variant="catalog"
          serverPaginated
          initialProducts={initialProducts}
          initialPagination={initialPagination}
        />
      </section>
    </div>
  );
}
