import { Suspense } from 'react';
import { Cormorant_Garamond } from 'next/font/google';
import Header from '../../components/Header';
import CategoryBrowser from '@/components/CategoryBrowser';
import { LoaderBlock } from '@/components/ui/loader';
import { getCategories } from '@/lib/categories';
import { metadataForPage } from '@/lib/seo';

const categoryDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

function categorySeoDescription(category) {
  if (category?.description) return category.description;
  const name = category?.name || 'jewellery';
  return `Explore Kyara Aura ${name.toLowerCase()} with elegant fashion jewellery pieces designed for daily wear, gifting, and special occasions.`;
}

async function getSelectedCategory(searchParams) {
  const params = await searchParams;
  const categoryId = typeof params?.category === 'string' ? params.category : '';

  if (!categoryId) return null;

  const categories = await getCategories();
  return categories.find((category) => {
    const values = [category._id, category.id, category.slug].filter(Boolean).map(String);
    return values.includes(categoryId);
  }) ?? null;
}

export async function generateMetadata({ searchParams }) {
  const selectedCategory = await getSelectedCategory(searchParams);

  if (selectedCategory) {
    const categoryId = selectedCategory._id ?? selectedCategory.id ?? selectedCategory.slug;

    return metadataForPage({
      title: `${selectedCategory.name} Jewellery | Kyara Aura Categories`,
      description: categorySeoDescription(selectedCategory),
      path: `/categories?category=${encodeURIComponent(categoryId)}`,
      images: selectedCategory.image ? [selectedCategory.image] : ['/assets/home1.jpg'],
    });
  }

  return metadataForPage({
    title: 'Jewellery Categories | Kyara Aura',
    description:
      'Browse Kyara Aura jewellery categories including bangles, earrings, necklaces, rings, and fashion jewellery collections for women.',
    path: '/categories',
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <Header />
      
      {/* Page Title and Description Section */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="text-center mb-4">
      
          <h1 className={`${categoryDisplay.className} mb-2 text-5xl font-medium tracking-[-0.05em] text-gray-950 md:text-5xl`}>
            Find Your Style
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            Categories tailored to your taste.
          </p>
        </div>
      </section>

      <Suspense fallback={<LoaderBlock />}>
        <CategoryBrowser />
      </Suspense>
      {categories.length ? (
        <section className="sr-only" aria-label="Jewellery category descriptions">
          <h2>Kyara Aura Jewellery Category Descriptions</h2>
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
