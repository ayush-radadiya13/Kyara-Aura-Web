"use client";

import { useMemo } from "react";
import CategoryGrid from "@/components/CategoryGrid";

export default function SubcategoryBrowser({ category }) {
  const subcategories = useMemo(() => {
    return Array.isArray(category?.children) ? category.children : [];
  }, [category]);

  if (!subcategories.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="mb-8 pt-4">
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
    </section>
  );
}
