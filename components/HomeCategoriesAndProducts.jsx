"use client";

import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";
import { resolveCategoryId } from "@/lib/category-seo";

const HEADER_OFFSET_PX = 104;

export default function HomeCategoriesAndProducts({
  initialCategories,
  initialProducts,
}) {
  const lenis = useLenis();
  const productsSectionRef = useRef(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const scrollToProductsSection = () => {
    const target = productsSectionRef.current;
    if (!target) return;

    // Native scroll is more reliable on mobile than Lenis programmatic scroll.
    // Pause Lenis so it does not fight the browser during the animation.
    lenis?.stop();

    const top =
      target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });

    window.setTimeout(() => {
      lenis?.resize();
      lenis?.start();
    }, 900);
  };

  const handleCategorySelect = (category) => {
    const categoryId = resolveCategoryId(category);
    if (!categoryId) return;

    setSelectedCategoryId(String(categoryId));
    setSelectedCategoryName(category?.name ?? "");

    // Section position does not depend on filtered products, so scroll immediately.
    requestAnimationFrame(scrollToProductsSection);
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
