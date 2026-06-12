"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Grid2X2, List } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { LoaderBlock } from "@/components/ui/loader";
import {
  useFeaturedProducts,
  useProducts,
  useProductsByCategory,
} from "@/hooks/use-products";

export default function ProductList({
  categoryId,
  featured = false,
  limit,
  emptyMessage = "No products available at the moment.",
  variant = "default",
  pageSize = 12,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const allProductsQuery = useProducts({
    enabled: !categoryId && !featured,
  });
  const categoryProductsQuery = useProductsByCategory(categoryId, {
    enabled: Boolean(categoryId),
  });
  const featuredProductsQuery = useFeaturedProducts({
    enabled: featured,
  });

  const query = featured
    ? featuredProductsQuery
    : categoryId
      ? categoryProductsQuery
      : allProductsQuery;
  const products = limit ? (query.data ?? []).slice(0, limit) : query.data ?? [];
  const shouldPaginate = !limit && products.length > pageSize;
  const totalPages = shouldPaginate ? Math.ceil(products.length / pageSize) : 1;
  const activePage = Math.min(currentPage, totalPages);
  const visibleProducts = shouldPaginate
    ? products.slice((activePage - 1) * pageSize, activePage * pageSize)
    : products;
  const resultStart = products.length ? (activePage - 1) * pageSize + 1 : 0;
  const resultEnd = Math.min(activePage * pageSize, products.length);
  const paginationPages = useMemo(() => {
    if (!shouldPaginate) return [];

    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [shouldPaginate, totalPages]);
  const isCatalog = variant === "catalog";

  if (query.isLoading) {
    return <LoaderBlock />;
  }

  if (query.isError || !products.length) {
    return (
      <p className="text-gray-600 py-12 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {isCatalog && (
        <div className="mb-10 flex flex-col gap-5 border-y border-gray-100 py-5 text-[14px] text-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Showing {resultStart}-{resultEnd} of {products.length} results.
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-9">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {["Price", "Material", "Brand", "Size"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className="flex items-center gap-8 text-[14px]  text-gray-800 transition hover:text-gold"
                >
                  {filter}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-4 border-l border-gray-200 pl-7 text-gray-400 sm:flex">
              <button type="button" aria-label="Grid view" className="transition hover:text-gray-900">
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button type="button" aria-label="List view" className="transition hover:text-gray-900">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          isCatalog
            ? "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4"
            : variant === "editorial"
            ? "grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
        }
      >
        {visibleProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant={isCatalog ? "editorial" : variant}
          />
        ))}
      </div>

      {shouldPaginate && (
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs"
          aria-label="Products pagination"
        >
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(Math.min(page, totalPages) - 1, 1))}
            disabled={activePage === 1}
            className="border border-gray-200 px-3 py-2 text-gray-600 transition hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {paginationPages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={activePage === page ? "page" : undefined}
              className={`h-9 min-w-9 border px-3 transition ${
                activePage === page
                  ? "border-gray-950 bg-gray-950 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-950 hover:text-gray-950"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(Math.min(page, totalPages) + 1, totalPages))}
            disabled={activePage === totalPages}
            className="border border-gray-200 px-3 py-2 text-gray-600 transition hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
