"use client";

import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";
import { useCategorySubcategories } from "@/hooks/use-categories";
import { resolveCategoryId } from "@/lib/category-seo";

export default function SubcategoryBrowser({
  category,
  initialSubcategories,
  initialCategoryProducts,
}) {
  const categoryId = resolveCategoryId(category);
  const hasInitialData =
    Array.isArray(initialSubcategories) || Array.isArray(initialCategoryProducts);

  const subcategoriesQuery = useCategorySubcategories(categoryId, {
    ...(hasInitialData
      ? {
          initialData: {
            subcategories: initialSubcategories ?? [],
            products: initialCategoryProducts ?? [],
          },
        }
      : {}),
  });

  const subcategories = subcategoriesQuery.data?.subcategories ?? [];
  const categoryProducts = subcategoriesQuery.data?.products ?? [];

  if (!subcategories.length && !categoryId) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      {subcategories.length ? (
        <div>
          <div className="mb-4 pt-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Choose a subcategory
            </p>
          </div>
          <CategoryGrid
            variant="strip"
            stackOnMobile
            columns={4}
            toProducts
            categories={subcategories}
          />
        </div>
      ) : null}

      {categoryId ? (
        <div
          className={
            subcategories.length
              ? "mt-6 border-t border-gray-100 pt-6"
              : "border-t border-gray-100 pt-6"
          }
        >
          <div className="mb-8">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Shop the collection
            </p>
            <h2 className="font-display text-2xl font-light text-gray-950 sm:text-3xl">
              {category?.name ? `New ${category.name} Arrivals` : "New Arrivals"}
            </h2>
          </div>
          <ProductList
            key={`category-products-${categoryId}`}
            limit={50}
            variant="editorial"
            emptyMessage={`No products available in ${category?.name ?? "this category"}.`}
            fixedProducts={categoryProducts}
            productsLoading={subcategoriesQuery.isPending}
          />
        </div>
      ) : null}
    </section>
  );
}
