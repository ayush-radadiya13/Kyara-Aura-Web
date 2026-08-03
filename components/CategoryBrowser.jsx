"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";
import {
  categorySubcategoriesPath,
  resolveCategorySlug,
} from "@/lib/category-seo";

export default function CategoryBrowser({
  initialCategories,
  initialFeaturedProducts,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("category") ?? "";

  const handleCategorySelect = (category) => {
    const categorySlug = resolveCategorySlug(category);
    if (!categorySlug) return;

    router.push(categorySubcategoriesPath(category), { scroll: false });
  };

  return (
    <section className=" sm:px-6 mb-10">
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          Choose a category
        </p>
        <h2 className="font-display text-xl font-light text-gray-950 sm:text-2xl">
          Shop by Category
        </h2>
      </div>
      <div>
        <CategoryGrid
          variant="strip"
          stackOnMobile
          dotLoader
          initialCategories={initialCategories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="mb-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Customer Favorites
          </p>
          <h2 className="font-display text-2xl font-light text-gray-950 sm:text-3xl">
            Best Seller
          </h2>
        </div>
        <ProductList
          featured
          limit={12}
          variant="editorial"
          emptyMessage="No featured products available at the moment."
          initialProducts={initialFeaturedProducts}
        />
      </div>
    </section>
  );
}
