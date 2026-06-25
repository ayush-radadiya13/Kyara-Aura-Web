"use client";
import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";

export default function CategoryBrowser({
  initialCategories,
  initialFeaturedProducts,
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="mb-8 pt-4">
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
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="mb-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Customer Favorites
          </p>
          <h2 className="font-display text-xl font-light text-gray-950 sm:text-2xl">
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
