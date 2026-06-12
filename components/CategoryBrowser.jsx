"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";
import { useCategories } from "@/hooks/use-categories";

export default function CategoryBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCategoryId = searchParams.get("category") ?? "";
  const { data: categories = [] } = useCategories();
  const [localCategoryId, setLocalCategoryId] = useState("");
  const selectedCategoryId = queryCategoryId || localCategoryId || categories[0]?._id || "";

  const selectedCategory = categories.find(
    (category) => String(category._id) === String(selectedCategoryId)
  );

  const handleCategorySelect = (category) => {
    setLocalCategoryId(category._id);
    router.push(`/products?category=${encodeURIComponent(category._id)}`);
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <CategoryGrid
          variant="strip"
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </section>

      <section className="mx-auto max-w-7xl border-t border-gray-100 px-4 pb-20 sm:px-6">
        <div className="mb-8 pt-12">
          <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">
            {selectedCategory ? `${selectedCategory.name} Products` : "Category Products"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Browse pieces from the selected category.
          </p>
        </div>
        <ProductList
          key={selectedCategoryId || "category-products"}
          categoryId={selectedCategoryId}
          variant="editorial"
          emptyMessage="No products available for this category."
        />
      </section>
    </>
  );
}
