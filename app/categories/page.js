import { Suspense } from 'react';
import { Cormorant_Garamond } from 'next/font/google';
import Header from '../../components/Header';
import CategoryBrowser from '@/components/CategoryBrowser';
import { DotLoaderBlock } from '@/components/ui/loader';
import { getCategories } from '@/lib/categories';
import {
  categoryProductsPath,
  categorySeoDescription,
  getSelectedCategoryFromParams,
  resolveCategoryId,
} from '@/lib/category-seo';
import { getFeaturedProducts } from '@/lib/products';
import { metadataForPage } from '@/lib/seo';

const categoryDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

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
      images: selectedCategory.image ? [selectedCategory.image] : ['/assets/home1.jpg'],
    });
  }

  return metadataForPage({
    title: 'Jewellery Categories | Kayra Aura',
    description:
      'Browse Kayra Aura jewellery categories including bangles, earrings, necklaces, rings, and fashion jewellery collections for women.',
    path: '/categories',
  });
}

export default async function CategoriesPage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div>
      <Header />
      
      {/* Page Title and Description Section */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="text-center mb-4">
      
          <h1 className={`${categoryDisplay.className} mb-2 text-5xl font-medium tracking-[-0.05em] text-gray-950 md:text-5xl`}>
            Find Your Style
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-gray-600 md:text-lg">
            Categories tailored to your taste.
          </p>
        </div>
      </section>

      <Suspense fallback={<DotLoaderBlock />}>
        <CategoryBrowser
          initialCategories={categories}
          initialFeaturedProducts={featuredProducts}
        />
      </Suspense>
      {categories.length ? (
        <section className="sr-only" aria-label="Jewellery category descriptions">
          <h2>Kayra Aura Jewellery Category Descriptions</h2>
          <ul>
            {categories.map((category) => (
              <li key={category._id ?? category.id ?? category.slug}>
                <h3>{category.name}</h3>
                <p>{categorySeoDescription(category)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
