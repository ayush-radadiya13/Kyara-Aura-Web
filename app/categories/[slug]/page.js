import { Suspense } from 'react';
import { Cormorant_Garamond } from 'next/font/google';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import SubcategoryBrowser from '@/components/SubcategoryBrowser';
import { DotLoaderBlock } from '@/components/ui/loader';
import { getCategoryBySlug, getCategorySubcategories } from '@/lib/categories';
import {
  categorySeoDescription,
  categorySubcategoriesPath,
} from '@/lib/category-seo';
import { metadataForPage } from '@/lib/seo';

const categoryDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category || category.type === 'sub') {
    return metadataForPage({
      title: 'Jewellery Categories | Kayra Aura',
      description:
        'Browse Kayra Aura jewellery categories including bangles, earrings, necklaces, rings, and fashion jewellery collections for women.',
      path: '/categories',
    });
  }

  return metadataForPage({
    title: `${category.name} Jewellery | Kayra Aura`,
    description: categorySeoDescription(category),
    path: categorySubcategoriesPath(category),
    images: category.image ? [category.image] : ['/assets/image.png'],
  });
}

export default async function CategorySubcategoriesPage({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category || category.type === 'sub') {
    notFound();
  }

  const categoryProductsPromise = category
    ? getCategorySubcategories(category._id ?? category.id)
    : Promise.resolve({ subcategories: [], products: [] });
  const { subcategories, products: categoryProducts } =
    await categoryProductsPromise;

  return (
    <div>
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mb-4 text-center">
          <h1
            className={`${categoryDisplay.className} mb-2 text-5xl font-medium tracking-[-0.05em] text-gray-950 md:text-5xl`}
          >
            {category.name}
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-gray-600 md:text-lg">
Browse all subcategories to find the products you are looking for          </p>
        </div>
      </section>

      <Suspense fallback={<DotLoaderBlock />}>
        <SubcategoryBrowser
          category={category}
          initialSubcategories={subcategories}
          initialCategoryProducts={categoryProducts}
        />
      </Suspense>
    </div>
  );
}
