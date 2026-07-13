"use client";

import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";
import { resolveCategoryId } from "@/lib/category-seo";

const HEADER_SCROLL_OFFSET = -96;

export default function HomeCategoriesAndProducts({
  initialCategories,
  initialProducts,
}) {
  const lenis = useLenis();
  const productsSectionRef = useRef(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const scrollToProducts = () => {
    const target = productsSectionRef.current;
    if (!target) return;

    // Wait a frame so filtered products can mount before measuring scroll target.
    requestAnimationFrame(() => {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: HEADER_SCROLL_OFFSET,
          duration: 1.05,
        });
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCategorySelect = (category) => {
    const categoryId = resolveCategoryId(category);
    if (!categoryId) return;

    setSelectedCategoryId(String(categoryId));
    setSelectedCategoryName(category?.name ?? "");
    scrollToProducts();
  };

  return (
    <>
      <section
        className="home-scroll-stable mx-auto max-w-7xl px-4 py-6 sm:px-6"
        style={{ "--home-delay": "90ms" }}
      >
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl ">
            Categories
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Find your perfect style.
          </p>
        </div>

        <CategoryGrid
          variant="strip"
          limit={6}
          initialCategories={initialCategories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </section>

      <section
        ref={productsSectionRef}
        id="home-products"
        className="home-scroll-stable mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 sm:px-6"
        style={{ "--home-delay": "160ms" }}
      >
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light text-gray-950 sm:text-4xl">
            {selectedCategoryName ? selectedCategoryName : "Products"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {selectedCategoryName
              ? `Browse pieces from ${selectedCategoryName}.`
              : "Browse our featured collection."}
          </p>
        </div>
        <ProductList
          key={selectedCategoryId || "all-home-products"}
          categoryId={selectedCategoryId || undefined}
          limit={20}
          variant="editorial"
          emptyMessage={
            selectedCategoryName
              ? `No products available in ${selectedCategoryName}.`
              : "No products available at the moment."
          }
          initialProducts={initialProducts}
        />
      </section>
    </>
  );
}
